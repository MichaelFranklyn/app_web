"use client";

import { Button } from "@/components/Button";
import { Input, SelectOption } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";

import { AccessFactoryRateResponse } from "../interface";
import { SELLER_BASIS_OPTIONS } from "../utils";
import { AgreementPreview } from "./AgreementPreview";
import {
  ACCESS_FACTORY_RATE_QUERY,
  UPDATE_SELLER_COMMISSION_AGREEMENT_MUTATION,
} from "./gql";
import {
  CommissionAgreementModalProps,
  UpdateAgreementResponse,
} from "./interface";

/** O texto do campo vira número; vazio é nulo, que significa "comissão inteira". */
const parseRate = (value: string): number | null =>
  value.trim() === "" ? null : Number(value);

/**
 * O acordo do escritório com o vendedor numa fábrica.
 *
 * Fica com `Input` direto, e não com o `FormBuilder`, porque tem conteúdo
 * reativo ENTRE os campos: a prévia muda a cada tecla, e `section.description`
 * do FormBuilder é `string`. É a mesma exceção do SettlePeriodModal e do
 * TenantPlanModal.
 *
 * A prévia não é enfeite. O campo pergunta a taxa do vendedor sobre o PEDIDO —
 * o número que se combina na rua —, e "3%" e "30%" ocupam o mesmo espaço na
 * tela: só o dinheiro denuncia qual dos dois foi digitado.
 */
export function CommissionAgreementModal({
  id,
  sellerName,
  factoryName,
  factoryId,
  sellerCommissionRate,
  sellerCommissionBasis,
  open,
  onOpenChange,
  onSaved,
}: CommissionAgreementModalProps) {
  const [rate, setRate] = useState("");
  const [basis, setBasis] = useState<SelectOption | null>(null);

  // A comissão da fábrica mora no vínculo empresa×fábrica, não no acesso do
  // vendedor — e é ela que diz quanto sobra para o escritório. A consulta é do MODAL, e
  // não da tabela: fora daqui ninguém precisa dela, e a lista de pessoas não
  // pode depender de uma resposta que ela não usa para desenhar as linhas.
  const { data: rateData } = useQuery<AccessFactoryRateResponse>(
    ACCESS_FACTORY_RATE_QUERY,
    {
      variables: {
        input: {
          filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
          first: 1,
        },
      },
      skip: !open || !factoryId,
    }
  );
  const factoryRate = Number(
    rateData?.access_factory_rate?.edges?.[0]?.node.commissionRate ?? 0
  );

  const [updateAgreement] = useMutation<UpdateAgreementResponse>(
    UPDATE_SELLER_COMMISSION_AGREEMENT_MUTATION
  );
  const { execute, isLoading } = useAsyncAction();

  // Reabrir mostra o que está salvo, não o rascunho da vez anterior.
  useEffect(() => {
    if (!open) return;
    setRate(
      sellerCommissionRate === null || sellerCommissionRate === undefined
        ? ""
        : String(Number(sellerCommissionRate))
    );
    setBasis(
      SELLER_BASIS_OPTIONS.find((o) => o.value === sellerCommissionBasis) ??
        null
    );
  }, [open, sellerCommissionRate, sellerCommissionBasis]);

  const handleSave = async () => {
    const rateValue = parseRate(rate);
    const basisValue = basis?.value ? basis.value : null;

    await execute(
      async () => {
        const res = await updateAgreement({
          variables: {
            id,
            input: {
              // Nulo já significa "não mexer" no update genérico, então limpar
              // o acordo precisa das flags próprias.
              sellerCommissionRate: rateValue,
              sellerCommissionBasis: basisValue,
              clearSellerCommissionRate: rateValue === null,
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
          description={`Quanto ${sellerName} ganha por pedido na fábrica ${factoryName}. O que sobrar da comissão fica no escritório.`}
        />

        <Modal.Body className="flex flex-col gap-16 py-24">
          <Input.Number
            label="Quanto o vendedor ganha por pedido (%)"
            placeholder="Ex: 3"
            min={0}
            max={100}
            step="0.01"
            addon="%"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            hint="Percentual sobre o valor do pedido, na mesma base da comissão da fábrica. Em branco, o vendedor recebe a comissão inteira."
          />

          <AgreementPreview rate={parseRate(rate)} factoryRate={factoryRate} />

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
