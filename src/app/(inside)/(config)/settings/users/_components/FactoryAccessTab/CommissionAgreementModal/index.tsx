"use client";

import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { SELLER_BASIS_OPTIONS } from "../utils";
import { AgreementPreview } from "./AgreementPreview";
import { UPDATE_SELLER_COMMISSION_AGREEMENT_MUTATION } from "./gql";
import {
  CommissionAgreementModalProps,
  UpdateAgreementResponse,
} from "./interface";

/** O texto do campo vira número; vazio é nulo, que significa "comissão inteira". */
const parseShare = (value: string): number | null =>
  value.trim() === "" ? null : Number(value);

/**
 * O acordo do escritório com o vendedor numa fábrica.
 *
 * Fica com `Input` direto, e não com o `FormBuilder`, porque tem conteúdo
 * reativo ENTRE os campos: a prévia muda a cada tecla, e `section.description`
 * do FormBuilder é `string`. É a mesma exceção do SettlePeriodModal e do
 * TenantPlanModal.
 *
 * A prévia não é enfeite. O campo pergunta a fatia DA COMISSÃO e é natural
 * digitar ali a taxa do vendedor sobre o PEDIDO — aconteceu na carteira real,
 * apesar de o rótulo e a dica dizerem o contrário. Números em reais resolvem o
 * que a frase não resolveu.
 */
export function CommissionAgreementModal({
  id,
  sellerName,
  factoryName,
  factoryCommissionRate,
  sellerCommissionShare,
  sellerCommissionBasis,
  open,
  onOpenChange,
  onSaved,
}: CommissionAgreementModalProps) {
  const [share, setShare] = useState("");
  const [basis, setBasis] = useState<SelectOption | null>(null);

  const [updateAgreement] = useMutation<UpdateAgreementResponse>(
    UPDATE_SELLER_COMMISSION_AGREEMENT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  // Reabrir mostra o que está salvo, não o rascunho da vez anterior.
  useEffect(() => {
    if (!open) return;
    setShare(
      sellerCommissionShare === null || sellerCommissionShare === undefined
        ? ""
        : String(Number(sellerCommissionShare))
    );
    setBasis(
      SELLER_BASIS_OPTIONS.find((o) => o.value === sellerCommissionBasis) ??
        null
    );
  }, [open, sellerCommissionShare, sellerCommissionBasis]);

  const handleSave = async () => {
    const shareValue = parseShare(share);
    const basisValue = basis?.value ? basis.value : null;

    await execute(
      async () => {
        const res = await updateAgreement({
          variables: {
            id,
            input: {
              // Nulo já significa "não mexer" no update genérico, então limpar
              // o acordo precisa das flags próprias.
              sellerCommissionShare: shareValue,
              sellerCommissionBasis: basisValue,
              clearSellerCommissionShare: shareValue === null,
              clearSellerCommissionBasis: basisValue === null,
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

        <Modal.Body className="flex flex-col gap-16 py-24">
          <Input.Number
            label="Quanto da comissão fica com o vendedor (%)"
            placeholder="Ex: 50"
            min={0}
            max={100}
            step="0.01"
            addon="%"
            value={share}
            onChange={(e) => setShare(e.target.value)}
            hint="Percentual DA COMISSÃO da fábrica, não do valor do pedido. Em branco, o vendedor recebe a comissão inteira."
          />

          <AgreementPreview
            share={parseShare(share)}
            factoryRate={factoryCommissionRate}
          />

          <Input.Select
            label="Quando o escritório repassa"
            options={SELLER_BASIS_OPTIONS}
            value={basis}
            variant="single"
            placeholder="Igual à fábrica"
            onChange={(val: SelectOption | SelectOption[] | null) =>
              setBasis(Array.isArray(val) ? (val[0] ?? null) : val)
            }
            hint="A fábrica pode pagar no faturamento e o escritório só repassar quando o cliente pagar o boleto."
          />

          <Title variant="body-sm" color="muted">
            Vale para os pedidos deste vendedor nesta fábrica. Repasses já
            lançados mantêm o valor que foi pago no dia.
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
            onClick={handleSave}
          >
            <Button.Title>Salvar acordo</Button.Title>
          </Button.Root>
        </Modal.Footer>
      </Modal.Content>
    </Modal.Root>
  );
}
