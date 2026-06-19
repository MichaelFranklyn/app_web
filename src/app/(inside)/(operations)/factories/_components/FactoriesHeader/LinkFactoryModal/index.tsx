"use client";

import { useMutation } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/Button";
import { FormBuilder, FormBuilderRef } from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";

import { CompanyFactory } from "../../../interface";
import { LINK_FACTORY_MUTATION } from "./gql";
import { LinkFactoryResponse } from "./interface";
import { FORM_STEPS, normalizeInput } from "./utils";

interface LinkFactoryModalProps {
  onAddOptimistic: (factory: CompanyFactory) => void;
}

export function LinkFactoryModal({ onAddOptimistic }: LinkFactoryModalProps) {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const formRef = useRef<FormBuilderRef>(null);
  const invalidateClient = useInvalidateQueriesClient();
  const totalSteps = FORM_STEPS.length;

  const [linkFactory] = useMutation<LinkFactoryResponse>(LINK_FACTORY_MUTATION);

  const { execute, isLoading } = useAsyncAction();

  const handleFooterClick = async () => {
    if (currentStep < totalSteps - 1) {
      const advanced = await formRef.current?.nextStep();
      if (advanced) setCurrentStep((prev) => prev + 1);
    } else {
      formRef.current?.submitForm();
    }
  };

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setCurrentStep(0);
      formRef.current?.resetForm();
    }
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    await execute(
      async () => {
        const res = await linkFactory({ variables: { input: normalizeInput(data) } });

        if (!res.data?.linkFactory?.status || !res.data.linkFactory.data) {
          throw new Error(res.data?.linkFactory?.message ?? "Erro ao vincular fábrica");
        }

        return res.data.linkFactory.data;
      },
      {
        successMessage: "Fábrica vinculada com sucesso",
        onSuccess: async (created) => {
          handleClose(false);
          onAddOptimistic({
            id: created.id,
            commissionRate: created.commissionRate,
            commissionCalcBasis: created.commissionCalcBasis,
            paymentTermDays: created.paymentTermDays,
            contractStart: created.contractStart,
            contractEnd: created.contractEnd,
            factory: created.factory,
          });
          await invalidateClient(["companyFactories"]);
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={handleClose}>
      <Modal.Trigger asChild>
        <Button.Root appearance="solid" color="amber" size="md">
          <Button.Icon icon={Plus} />
          <Button.Title>Vincular Fábrica</Button.Title>
        </Button.Root>
      </Modal.Trigger>

      <Modal.Content size="md">
        <Modal.Header
          title="Vincular Fábrica"
          description="Adicione uma nova fábrica e configure os termos comerciais da parceria."
        />
        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={FORM_STEPS}
            onSubmit={handleSubmit}
            loading={isLoading}
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
            onClick={handleFooterClick}
          >
            <Button.Title>
              {currentStep < totalSteps - 1 ? "Próximo" : "Vincular"}
            </Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
