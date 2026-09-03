"use client";

import { Button } from "@/components/Button";
import { SelectionBar } from "@/components/SelectionBar";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation } from "@apollo/client/react";
import { Ban, CircleDollarSign, HandCoins } from "lucide-react";
import { useMemo } from "react";
import {
  MARK_CHARGEBACK_REFUNDED_MUTATION,
  MARK_CHARGEBACK_SETTLED_MUTATION,
  MARK_INSTALLMENTS_DEFAULTED_MUTATION,
  MARK_SELLER_COMMISSION_PAID_MUTATION,
  PAY_ORDER_INSTALLMENTS_MUTATION,
} from "../../gql";
import { CommissionRow } from "../../interface";
import { defaultImpact, YearMonth } from "../../utils";
import { DateActionModal } from "../DateActionModal";
import { MarkReceivedModal } from "../MarkReceivedModal";
import { DefaultImpactNotice } from "./DefaultImpactNotice";

interface StatusResponse {
  status: boolean;
  message: string;
}

interface Props {
  /** Parcelas marcadas na tabela desta fábrica. */
  selectedIds: string[];
  /** Subconjunto que está a receber da fábrica (para "Recebi"). */
  receivableIds: string[];
  /**
   * TODAS as linhas da tela (todos os meses e fábricas): é o que permite dizer,
   * antes de confirmar o calote, que fatia do mês do vendedor o estorno consome.
   */
  allRows: CommissionRow[];
  /** Mês aberto — a referência do "quanto sobra" mostrado no aviso. */
  month: YearMonth;
  /** Onde a seleção vale, mostrado na barra: "Fábrica Alfa · agosto de 2026". */
  scopeLabel?: string;
  onClear: () => void;
  onChanged: () => void;
}

/**
 * Ações do lote selecionado, na barra fixa da base da janela.
 *
 * A conferência é sempre por fábrica: o relatório que a fábrica manda quando
 * paga as comissões é a única forma de saber quem pagou o boleto e quem não
 * pagou. Marcar dezenas de linhas uma a uma era o gargalo dessa conferência.
 *
 * Quem monta a barra é o `SelectionBar` — antes ela era desenhada aqui, presa
 * ao fim do cartão da fábrica: marcar a primeira linha de uma tabela longa fazia
 * a barra nascer fora da tela, e a seleção parecia não fazer nada.
 */
export function BulkActionsBar({
  selectedIds,
  receivableIds,
  allRows,
  month,
  scopeLabel,
  onClear,
  onChanged,
}: Props) {
  const [payInstallments] = useMutation<{
    payOrderInstallments: StatusResponse;
  }>(PAY_ORDER_INSTALLMENTS_MUTATION);
  const [markDefaulted] = useMutation<{
    markOrderInstallmentsDefaulted: StatusResponse;
  }>(MARK_INSTALLMENTS_DEFAULTED_MUTATION);
  const [markSellerPaid] = useMutation<{
    markSellerCommissionPaid: StatusResponse;
  }>(MARK_SELLER_COMMISSION_PAID_MUTATION);
  const [markChargebackSettled] = useMutation<{
    markChargebackSettled: StatusResponse;
  }>(MARK_CHARGEBACK_SETTLED_MUTATION);
  const [markChargebackRefunded] = useMutation<{
    markChargebackRefunded: StatusResponse;
  }>(MARK_CHARGEBACK_REFUNDED_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const impact = useMemo(() => {
    const ids = new Set(selectedIds);
    return defaultImpact(
      allRows.filter((row) => ids.has(row.installmentId)),
      allRows,
      month
    );
  }, [selectedIds, allRows, month]);

  // Estorno e devolução da FÁBRICA: só aparecem quando há linhas nesses
  // estados no lote, para a barra não crescer com botão que não serve.
  const { chargebackIds, refundIds } = useMemo(() => {
    const ids = new Set(selectedIds);
    const doLote = allRows.filter((row) => ids.has(row.installmentId));
    return {
      chargebackIds: doLote
        .filter((row) => row.status === "chargeback")
        .map((row) => row.installmentId),
      refundIds: doLote
        .filter((row) => row.status === "refund")
        .map((row) => row.installmentId),
    };
  }, [selectedIds, allRows]);

  if (selectedIds.length === 0) return null;

  const count = selectedIds.length;

  return (
    <SelectionBar
      count={count}
      noun={{
        singular: "parcela selecionada",
        plural: "parcelas selecionadas",
      }}
      scopeLabel={scopeLabel}
      onClear={onClear}
    >
      <DateActionModal
        label="Cliente pagou"
        icon={CircleDollarSign}
        color="green"
        title={`Marcar ${count} boleto(s) como pago(s)`}
        description="Baixa dos boletos conforme o relatório da fábrica. Boletos já baixados são ignorados."
        dateLabel="Data do pagamento"
        dateHint="Dia em que o cliente pagou. É ela que define em qual repasse a comissão entra — um boleto pago com atraso cai no fechamento seguinte."
        confirmLabel="Confirmar pagamento"
        successMessage="Boletos marcados como pagos"
        onConfirm={async (paidAt) => {
          const res = await payInstallments({
            variables: { installmentIds: selectedIds, paidAt },
          });
          if (!res.data?.payOrderInstallments?.status) {
            throw new Error(
              res.data?.payOrderInstallments?.message ??
                "Erro ao marcar os boletos como pagos"
            );
          }
        }}
        onSuccess={() => {
          onClear();
          onChanged();
        }}
      />

      <DateActionModal
        label="Não pagou"
        icon={Ban}
        color="red"
        title={`Marcar ${count} boleto(s) como inadimplente(s)`}
        description="O cliente não pagou. A comissão deixa de ser devida e, se já tiver sido paga, volta como estorno no fechamento seguinte."
        dateLabel="Data da inadimplência"
        dateHint="Quando o calote foi confirmado. Define em qual fechamento o estorno entra."
        confirmLabel="Marcar inadimplente"
        successMessage="Boletos marcados como inadimplentes"
        onConfirm={async (defaultedAt) => {
          const res = await markDefaulted({
            variables: { installmentIds: selectedIds, defaultedAt },
          });
          if (!res.data?.markOrderInstallmentsDefaulted?.status) {
            throw new Error(
              res.data?.markOrderInstallmentsDefaulted?.message ??
                "Erro ao marcar inadimplência"
            );
          }
        }}
        onSuccess={() => {
          onClear();
          onChanged();
        }}
      >
        <DefaultImpactNotice impact={impact} month={month} />
      </DateActionModal>

      <DateActionModal
        label="Repassei ao vendedor"
        icon={HandCoins}
        color="neutral"
        title={`Registrar repasse de ${count} comissão(ões)`}
        description="Registra que o escritório pagou ao vendedor a comissão dele destas parcelas."
        dateLabel="Data do repasse"
        dateHint="Dia em que o vendedor recebeu."
        confirmLabel="Confirmar repasse"
        successMessage="Repasse registrado"
        onConfirm={async (paidAt) => {
          const res = await markSellerPaid({
            variables: { installmentIds: selectedIds, paidAt },
          });
          if (!res.data?.markSellerCommissionPaid?.status) {
            throw new Error(
              res.data?.markSellerCommissionPaid?.message ??
                "Erro ao registrar o repasse"
            );
          }
        }}
        onSuccess={() => {
          onClear();
          onChanged();
        }}
      />

      {chargebackIds.length > 0 && (
        <DateActionModal
          label={`Fábrica descontou (${chargebackIds.length})`}
          icon={Ban}
          color="red"
          title={`Registrar desconto de ${chargebackIds.length} estorno(s)`}
          description="A fábrica já abateu estes estornos no repasse. Eles viram histórico e param de pesar nos próximos fechamentos."
          dateLabel="Data do desconto"
          dateHint="Dia do repasse em que o abatimento apareceu."
          confirmLabel="Registrar desconto"
          successMessage="Estornos baixados"
          onConfirm={async (settledAt) => {
            const res = await markChargebackSettled({
              variables: { installmentIds: chargebackIds, settledAt },
            });
            if (!res.data?.markChargebackSettled?.status) {
              throw new Error(
                res.data?.markChargebackSettled?.message ??
                  "Erro ao baixar os estornos"
              );
            }
          }}
          onSuccess={() => {
            onClear();
            onChanged();
          }}
        />
      )}

      {refundIds.length > 0 && (
        <Button.Root
          appearance="ghost"
          color="green"
          size="sm"
          noUppercase
          loading={isLoading}
          onClick={() =>
            execute(
              async () => {
                const res = await markChargebackRefunded({
                  variables: { installmentIds: refundIds },
                });
                if (!res.data?.markChargebackRefunded?.status) {
                  throw new Error(
                    res.data?.markChargebackRefunded?.message ??
                      "Erro ao registrar a devolução"
                  );
                }
              },
              {
                successMessage: "Devolução da fábrica registrada",
                onSuccess: () => {
                  onClear();
                  onChanged();
                },
              }
            )
          }
        >
          <Button.Icon icon={HandCoins} />
          <Button.Title>Fábrica devolveu ({refundIds.length})</Button.Title>
        </Button.Root>
      )}

      {receivableIds.length > 0 && (
        <MarkReceivedModal
          installmentIds={receivableIds}
          label={`Recebi da fábrica (${receivableIds.length})`}
          onSuccess={() => {
            onClear();
            onChanged();
          }}
        />
      )}
    </SelectionBar>
  );
}
