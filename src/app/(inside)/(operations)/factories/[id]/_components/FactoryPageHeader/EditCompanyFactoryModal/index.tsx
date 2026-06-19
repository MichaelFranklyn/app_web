"use client";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";
import { UPDATE_COMPANY_FACTORY_MUTATION } from "./gql";
import { UpdateCompanyFactoryResponse } from "./interface";
import { COMMISSION_BASIS_OPTIONS, FORM_STEPS, normalizeInput } from "./utils";
import { parseLocalDate } from "@/utils/format/date";
import { useFactoryDetail } from "../../../context";
import { CompanyFactoryDetail } from "../../../interface";

export function EditCompanyFactoryModal() {
  const { companyFactory, updateOptimistic, commit, rollback, refetch } =
    useFactoryDetail();
  const [open, setOpen] = useState(false);
  const formRef = useRef<FormBuilderRef>(null);

  const [updateCompanyFactory] = useMutation<UpdateCompanyFactoryResponse>(
    UPDATE_COMPANY_FACTORY_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const handleSubmit = async (data: Record<string, unknown>) => {
    const normalized = normalizeInput(data, companyFactory);

    if (Object.keys(normalized).length === 0) {
      setOpen(false);
      return;
    }

    setOpen(false);
    updateOptimistic(normalized as Partial<CompanyFactoryDetail>);

    await execute(
      async () => {
        const res = await updateCompanyFactory({
          variables: { id: companyFactory.id, input: normalized },
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
    paymentTermDays: companyFactory.paymentTermDays,
    territory: companyFactory.territory,
    contractStart: parseLocalDate(companyFactory.contractStart),
    contractEnd: parseLocalDate(companyFactory.contractEnd),
  };

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
          title="Editar condições comerciais"
          description="Altere os termos da relação com esta fábrica."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={FORM_STEPS}
            onSubmit={handleSubmit}
            loading={isLoading}
            initialData={initialData}
            unstyled
          />
        </Modal.Body>
        <Modal.Footer>
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
          <Button.Root
            type="button"
            appearance="solid"
            color="amber"
            size="md"
            noUppercase
            loading={isLoading}
            onClick={() => formRef.current?.submitForm()}
          >
            <Button.Title>Salvar</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
