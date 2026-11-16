"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { MoreOption, MoreOptions } from "@/components/MoreOptions";
import { Table } from "@/components/Table";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { COMMISSION_CACHE_FIELDS } from "@/utils/cacheFields";
import { getTodayIso } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { Ban, RotateCcw, XCircle } from "lucide-react";
import { useState } from "react";
import {
  CANCEL_ORDER_INSTALLMENT_MUTATION,
  MARK_ORDER_INSTALLMENTS_DEFAULTED_MUTATION,
  REVERT_ORDER_INSTALLMENT_MUTATION,
} from "../../gql";
import { OrderInstallment } from "../../interface";
import { PayInstallmentModal } from "./PayInstallmentModal";

interface StatusResponse {
  status: boolean;
  message: string;
}

interface Props {
  installment: OrderInstallment;
  onChanged: () => void;
}

type ConfirmKind = "defaulted" | "cancel" | "revert" | null;

/**
 * Ações da parcela: "Pago" (o caso comum) fica à vista; o resto vai para o
 * menu "…". Antes eram três botões na linha (Pago, Inadimplente, Cancelar
 * boleto) e no celular a linha virava uma régua de ações (revisão 13/11/2026).
 */
export function InstallmentRowActions({ installment, onChanged }: Props) {
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [cancelInstallment] = useMutation<{
    cancelOrderInstallment: StatusResponse;
  }>(CANCEL_ORDER_INSTALLMENT_MUTATION);
  const [revertInstallment] = useMutation<{
    revertOrderInstallment: StatusResponse;
  }>(REVERT_ORDER_INSTALLMENT_MUTATION);
  const [markDefaulted] = useMutation<{
    markOrderInstallmentsDefaulted: StatusResponse;
  }>(MARK_ORDER_INSTALLMENTS_DEFAULTED_MUTATION);
  const invalidateClient = useInvalidateQueriesClient();

  /**
   * A parcela é o elo entre o pedido e a comissão: pagar, cancelar, reverter ou
   * marcar inadimplente aqui muda a linha que /commissions e o relatório
   * mostram. Antes do `invalidate`, a tela de comissões só via a mudança com F5.
   */
  const syncInstallment = () => {
    onChanged();
    void invalidateClient(COMMISSION_CACHE_FIELDS);
  };

  // Comissão recebida sem calote é estado fechado: nada a fazer na linha.
  if (installment.isCommissionReceived && installment.status !== "DEFAULTED") {
    return <Table.CellText variant="dim">—</Table.CellText>;
  }

  const isOpen =
    installment.status === "PENDING" || installment.status === "DEFAULTED";

  const menu: MoreOption[] =
    installment.status === "PENDING"
      ? [
          {
            label: "Cancelar boleto",
            icon: XCircle,
            onClick: () => setConfirm("cancel"),
          },
          {
            label: "Cliente não pagou (inadimplente)",
            icon: Ban,
            danger: true,
            onClick: () => setConfirm("defaulted"),
          },
        ]
      : [
          {
            label: "Reverter para pendente",
            icon: RotateCcw,
            onClick: () => setConfirm("revert"),
          },
        ];

  return (
    <div className="flex items-center justify-end gap-4">
      {isOpen && (
        <PayInstallmentModal
          installmentId={installment.id}
          sequence={installment.sequence}
          onSuccess={syncInstallment}
        />
      )}

      {installment.status === "PENDING" && (
        <>
          <ConfirmModal
            open={confirm === "defaulted"}
            onOpenChange={(v) => setConfirm(v ? "defaulted" : null)}
            title={`Marcar parcela ${installment.sequence} como inadimplente`}
            description="Use quando o cliente não pagou o boleto. A comissão desta parcela deixa de ser devida — e, se já tiver sido paga, vira estorno no próximo fechamento."
            confirmLabel="Marcar inadimplente"
            confirmColor="red"
            successMessage="Parcela marcada como inadimplente"
            onConfirm={async () => {
              const res = await markDefaulted({
                variables: {
                  installmentIds: [installment.id],
                  defaultedAt: getTodayIso(),
                },
              });
              if (!res.data?.markOrderInstallmentsDefaulted?.status) {
                throw new Error(
                  res.data?.markOrderInstallmentsDefaulted?.message ??
                    "Erro ao marcar inadimplência"
                );
              }
            }}
            onSuccess={syncInstallment}
          />

          <ConfirmModal
            open={confirm === "cancel"}
            onOpenChange={(v) => setConfirm(v ? "cancel" : null)}
            title={`Cancelar parcela ${installment.sequence}`}
            description="Use quando o boleto deixou de existir (a fábrica cancelou, houve acerto direto). Não é inadimplência: nada é estornado."
            confirmLabel="Cancelar boleto"
            successMessage="Parcela cancelada"
            onConfirm={async () => {
              const res = await cancelInstallment({
                variables: { id: installment.id },
              });
              if (!res.data?.cancelOrderInstallment?.status) {
                throw new Error(
                  res.data?.cancelOrderInstallment?.message ??
                    "Erro ao cancelar parcela"
                );
              }
            }}
            onSuccess={syncInstallment}
          />
        </>
      )}

      {installment.status !== "PENDING" && (
        <ConfirmModal
          open={confirm === "revert"}
          onOpenChange={(v) => setConfirm(v ? "revert" : null)}
          title={`Reverter parcela ${installment.sequence}`}
          description="Volta a parcela para pendente, desfazendo o pagamento, o cancelamento ou a inadimplência."
          confirmLabel="Reverter"
          successMessage="Parcela voltou para pendente"
          onConfirm={async () => {
            const res = await revertInstallment({
              variables: { id: installment.id },
            });
            if (!res.data?.revertOrderInstallment?.status) {
              throw new Error(
                res.data?.revertOrderInstallment?.message ??
                  "Erro ao reverter parcela"
              );
            }
          }}
          onSuccess={syncInstallment}
        />
      )}

      {menu.length > 0 && (
        <MoreOptions
          options={menu}
          label={`Mais ações da parcela ${installment.sequence}`}
        />
      )}
    </div>
  );
}
