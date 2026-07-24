"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { useLogoUpload } from "@/components/LogoUpload";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { parseLocalDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFactoryDetail } from "../../../context";
import { CompanyFactoryDetail } from "../../../interface";
import { UPDATE_COMPANY_FACTORY_MUTATION } from "./gql";
import {
  UpdateCompanyFactoryInput,
  UpdateCompanyFactoryResponse,
} from "./interface";
import { StepIdentity } from "./StepIdentity";
import { COMMISSION_BASIS_OPTIONS, FORM_STEPS, normalizeInput } from "./utils";

// Trilha exibida no topo. O primeiro passo é custom (identidade visual); os
// outros dois são os steps do FormBuilder, na mesma ordem.
const WIZARD_STEPS: FormStepSchema[] = [
  { id: "identity", title: "Identidade", sections: [] },
  { id: "commission", title: "Comissão", sections: [] },
  { id: "contract", title: "Contrato", sections: [] },
];

const STEP_DESCRIPTIONS = [
  "Como esta fábrica aparece para você e nos pedidos que você envia ao cliente.",
  "Quanto esta fábrica paga de comissão e quando ela repassa.",
  "Território de atuação e as condições do contrato.",
];

export function EditCompanyFactoryModal() {
  const { companyFactory, updateOptimistic, commit, rollback, refetch } =
    useFactoryDetail();
  const { factory } = companyFactory;
  const [open, setOpen] = useState(false);
  // 0 = identidade (custom); 1 e 2 = passos do FormBuilder.
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState(factory.nickname ?? "");
  const formRef = useRef<FormBuilderRef>(null);

  const {
    value: logoValue,
    onChange: onLogoChange,
    reset: resetLogo,
    toLogoInput,
  } = useLogoUpload();

  const [updateCompanyFactory] = useMutation<UpdateCompanyFactoryResponse>(
    UPDATE_COMPANY_FACTORY_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  // Reabrir mostra o que está salvo, não o rascunho da vez anterior.
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setNickname(factory.nickname ?? "");
    resetLogo();
  }, [open, factory.nickname, resetLogo]);

  const handleNext = async () => {
    // Identidade não tem campo obrigatório: avança direto para o formulário.
    if (step === 0) {
      setStep(1);
      return;
    }
    const advanced = await formRef.current?.nextStep();
    if (advanced) setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    // Voltar do primeiro passo do FormBuilder não mexe nele — só reexibe a
    // identidade; dos demais, recua o passo interno junto.
    if (step > 1) formRef.current?.prevStep();
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const commercial = normalizeInput(data, companyFactory);

    const branding: UpdateCompanyFactoryInput = await toLogoInput();
    const trimmedNickname = nickname.trim();
    if (trimmedNickname !== (factory.nickname ?? "")) {
      branding.nickname = trimmedNickname;
    }

    const input = { ...commercial, ...branding };
    if (Object.keys(input).length === 0) {
      setOpen(false);
      return;
    }

    setOpen(false);
    // Otimismo: termos comerciais estão no nível raiz; o apelido vive em
    // `factory` (aninhado, resolvido do vínculo no backend), então funde o objeto
    // `factory` inteiro preservando os demais campos — o merge do hook é raso.
    // `"" → null` espelha a normalização do backend (mutations.py: strip() or None)
    // p/ o factoryName cair no nome fantasia. A logo segue vindo pelo refetch: o
    // front não tem a URL final /media/... que o backend gera.
    const optimistic: Partial<CompanyFactoryDetail> = {
      ...(commercial as Partial<CompanyFactoryDetail>),
    };
    if (branding.nickname !== undefined) {
      optimistic.factory = { ...factory, nickname: branding.nickname || null };
    }
    if (Object.keys(optimistic).length > 0) {
      updateOptimistic(optimistic);
    }

    await execute(
      async () => {
        const res = await updateCompanyFactory({
          variables: { id: companyFactory.id, input },
        });

        if (
          !res.data?.updateCompanyFactory?.status ||
          !res.data.updateCompanyFactory.data
        ) {
          throw new Error(
            res.data?.updateCompanyFactory?.message ?? "Erro ao editar"
          );
        }

        return res.data.updateCompanyFactory.data;
      },
      {
        successMessage: "Fábrica atualizada com sucesso",
        onSuccess: async () => {
          formRef.current?.resetForm();
          resetLogo();
          commit();
          refetch();
        },
        onError: () => {
          rollback();
        },
      }
    );
  };

  const initialData = {
    commissionRate: companyFactory.commissionRate,
    commissionCalcBasis:
      COMMISSION_BASIS_OPTIONS.find(
        (opt) => opt.value === companyFactory.commissionCalcBasis
      ) ?? null,
    paymentDays: (
      companyFactory.commissionPaymentDays ?? [companyFactory.paymentTermDays]
    ).join(", "),
    territory: companyFactory.territory,
    contractStart: parseLocalDate(companyFactory.contractStart),
    contractEnd: parseLocalDate(companyFactory.contractEnd),
    ipiInOrder: companyFactory.ipiInOrder ? ["true"] : [],
    deliveryEstimateDays: companyFactory.deliveryEstimateDays ?? "",
  };

  const isLastStep = step === WIZARD_STEPS.length - 1;

  return (
    <Modal.Root open={open} onOpenChange={setOpen}>
      <Modal.Trigger asChild>
        <Button.Root appearance="outline" color="neutral" size="sm">
          <Button.Icon icon={Pencil} />
          <Button.Title>Editar</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Editar fábrica"
          description={STEP_DESCRIPTIONS[step]}
        />
        <Modal.Body>
          <FormBuilder.Stepper
            steps={WIZARD_STEPS}
            currentStepIndex={step}
            centered
            className="mb-32"
          />

          {/* Os dois blocos ficam montados: navegar entre passos não pode
              descartar o que já foi preenchido. */}
          <div className={step === 0 ? "" : "hidden"}>
            <StepIdentity
              factory={factory}
              nickname={nickname}
              onNicknameChange={setNickname}
              logo={logoValue}
              onLogoChange={onLogoChange}
              disabled={isLoading}
            />
          </div>
          <div className={step === 0 ? "hidden" : ""}>
            <FormBuilder
              ref={formRef}
              steps={FORM_STEPS}
              onSubmit={handleSubmit}
              loading={isLoading}
              initialData={initialData}
              unstyled
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          {step === 0 ? (
            <Modal.Close asChild>
              <Button.Root
                type="button"
                appearance="ghost"
                color="neutral"
                size="md"
                noUppercase
                disabled={isLoading}
              >
                <Button.Title>Cancelar</Button.Title>
              </Button.Root>
            </Modal.Close>
          ) : (
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="md"
              noUppercase
              disabled={isLoading}
              onClick={handleBack}
            >
              <Button.Title>Voltar</Button.Title>
            </Button.Root>
          )}
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={() =>
              isLastStep ? formRef.current?.submitForm() : handleNext()
            }
          >
            <Button.Title>{isLastStep ? "Salvar" : "Próximo"}</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
