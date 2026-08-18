"use client";

import { Button } from "@/components/Button";
import {
  FormBuilder,
  FormBuilderRef,
  FormStepSchema,
} from "@/components/FormBuilder";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useMemo, useRef } from "react";
import { SELLER_BASIS_OPTIONS } from "../utils";
import { UPDATE_SELLER_COMMISSION_AGREEMENT_MUTATION } from "./gql";
import {
  CommissionAgreementModalProps,
  UpdateAgreementResponse,
} from "./interface";

export function CommissionAgreementModal({
  id,
  sellerName,
  factoryName,
  sellerCommissionShare,
  sellerCommissionBasis,
  open,
  onOpenChange,
  onSaved,
}: CommissionAgreementModalProps) {
  const formRef = useRef<FormBuilderRef>(null);
  const [updateAgreement] = useMutation<UpdateAgreementResponse>(
    UPDATE_SELLER_COMMISSION_AGREEMENT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  const steps = useMemo<FormStepSchema[]>(
    () => [
      {
        id: "agreement",
        sections: [
          {
            id: "seller-commission",
            fields: [
              {
                name: "share",
                type: "number",
                label: "Quanto da comissão fica com o vendedor (%)",
                placeholder: "Ex: 50",
                hint: "Percentual DA COMISSÃO da fábrica, não do valor do pedido. Em branco, o vendedor recebe a comissão inteira.",
              },
              {
                name: "basis",
                type: "select-single",
                label: "Quando o escritório repassa",
                options: SELLER_BASIS_OPTIONS,
                placeholder: "Igual à fábrica",
                hint: "A fábrica pode pagar no faturamento e o escritório só repassar quando o cliente pagar o boleto.",
              },
            ],
          },
        ],
      },
    ],
    []
  );

  const initialData = useMemo(
    () => ({
      share: sellerCommissionShare ?? "",
      basis: sellerCommissionBasis
        ? (SELLER_BASIS_OPTIONS.find(
            (o) => o.value === sellerCommissionBasis
          ) ?? null)
        : null,
    }),
    [sellerCommissionShare, sellerCommissionBasis]
  );

  const handleSubmit = async (data: Record<string, unknown>) => {
    const rawShare = data.share;
    const share =
      rawShare === "" || rawShare === null || rawShare === undefined
        ? null
        : Number(rawShare);
    const basisOption = data.basis as { value: string } | null;
    const basis = basisOption?.value ? basisOption.value : null;

    await execute(
      async () => {
        const res = await updateAgreement({
          variables: {
            id,
            input: {
              // Nulo já significa "não mexer" no update genérico, então limpar
              // o acordo precisa das flags próprias.
              sellerCommissionShare: share,
              sellerCommissionBasis: basis,
              clearSellerCommissionShare: share === null,
              clearSellerCommissionBasis: basis === null,
            },
          },
        });
        if (!res.data?.updateSellerFactoryAccess?.status) {
          throw new Error(
            res.data?.updateSellerFactoryAccess?.message ??
              "Erro ao salvar o acordo de comissão"
          );
        }
        return res.data.updateSellerFactoryAccess;
      },
      {
        successMessage: "Acordo de comissão atualizado",
        onSuccess: () => {
          onOpenChange(false);
          onSaved();
        },
      }
    );
  };

  return (
    <Modal.Root open={open} onOpenChange={onOpenChange}>
      <Modal.Content size="md">
        <Modal.Header
          title="Comissão do vendedor"
          description={`Quanto ${sellerName} recebe da comissão que a fábrica ${factoryName} paga ao escritório.`}
        />

        <Modal.Body>
          <FormBuilder
            ref={formRef}
            steps={steps}
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={isLoading}
            unstyled
          />
          <Title variant="body-sm" color="muted" className="mt-12 block">
            Vale para os pedidos deste vendedor nesta fábrica. Comissões já
            recebidas não são recalculadas.
          </Title>
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
            <Button.Title>Salvar acordo</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
