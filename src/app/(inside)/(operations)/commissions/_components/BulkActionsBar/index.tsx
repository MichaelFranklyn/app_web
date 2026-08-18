"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { useMutation } from "@apollo/client/react";
import { Ban, CircleDollarSign, HandCoins } from "lucide-react";
import {
  MARK_INSTALLMENTS_DEFAULTED_MUTATION,
  MARK_SELLER_COMMISSION_PAID_MUTATION,
  PAY_ORDER_INSTALLMENTS_MUTATION,
} from "../../gql";
import { DateActionModal } from "../DateActionModal";
import { MarkReceivedModal } from "../MarkReceivedModal";

interface StatusResponse {
  status: boolean;
  message: string;
}

interface Props {
  /** Parcelas marcadas na tabela desta fábrica. */
  selectedIds: string[];
  /** Subconjunto que está a receber da fábrica (para "Recebi"). */
  receivableIds: string[];
  onClear: () => void;
  onChanged: () => void;
}

/**
 * Ações do lote selecionado, dentro do cartão da fábrica.
 *
 * A conferência é sempre por fábrica: o relatório que a fábrica manda quando
 * paga as comissões é a única forma de saber quem pagou o boleto e quem não
 * pagou. Marcar dezenas de linhas uma a uma era o gargalo dessa conferência.
 */
export function BulkActionsBar({
  selectedIds,
  receivableIds,
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

  if (selectedIds.length === 0) return null;

  const count = selectedIds.length;

  return (
    <div className="flex flex-wrap items-center gap-12 border-t border-(--border) bg-(--bg3) px-16 py-12">
      <Title variant="body-sm" weight="semibold">
        {count} parcela(s) selecionada(s)
      </Title>

      <div className="flex flex-1 flex-wrap items-center justify-end gap-8">
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
        />

        <DateActionModal
          label="Repassei ao vendedor"
          icon={HandCoins}
          color="neutral"
          title={`Registrar repasse de ${count} comissão(ões)`}
          description="Registra que o escritório pagou ao vendedor a fatia dele destas parcelas."
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

        <Button.Root
          appearance="ghost"
          color="neutral"
          size="sm"
          noUppercase
          onClick={onClear}
        >
          <Button.Title>Limpar seleção</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
