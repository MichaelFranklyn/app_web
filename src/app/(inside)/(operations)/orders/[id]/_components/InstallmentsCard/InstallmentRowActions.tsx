"use client";

import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Table } from "@/components/Table";
import { getTodayIso } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { Ban, RotateCcw, XCircle } from "lucide-react";
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

export function InstallmentRowActions({ installment, onChanged }: Props) {
  const [cancelInstallment] = useMutation<{
    cancelOrderInstallment: StatusResponse;
  }>(CANCEL_ORDER_INSTALLMENT_MUTATION);
  const [revertInstallment] = useMutation<{
    revertOrderInstallment: StatusResponse;
  }>(REVERT_ORDER_INSTALLMENT_MUTATION);
  const [markDefaulted] = useMutation<{
    markOrderInstallmentsDefaulted: StatusResponse;
  }>(MARK_ORDER_INSTALLMENTS_DEFAULTED_MUTATION);

  // Comissão recebida sem calote é estado fechado: nada a fazer na linha.
  if (installment.isCommissionReceived && installment.status !== "DEFAULTED") {
    return <Table.CellText variant="dim">—</Table.CellText>;
  }

  const isOpen =
    installment.status === "PENDING" || installment.status === "DEFAULTED";

  return (
    <div className="flex items-center justify-end gap-4">
      {isOpen && (
        <PayInstallmentModal
          installmentId={installment.id}
          sequence={installment.sequence}
          onSuccess={onChanged}
        />
      )}

      {installment.status === "PENDING" && (
        <>
          <ConfirmModal
            trigger={
              <Button.Root appearance="ghost" color="red" size="sm">
                <Button.Icon icon={Ban} />
                <Button.Title>Inadimplente</Button.Title>
              </Button.Root>
            }
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
            onSuccess={onChanged}
          />

          <ConfirmModal
            trigger={
              <Button.Root appearance="ghost" color="neutral" size="sm">
                <Button.Icon icon={XCircle} />
                <Button.Title>Cancelar boleto</Button.Title>
              </Button.Root>
            }
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
            onSuccess={onChanged}
          />
        </>
      )}

      {installment.status !== "PENDING" && (
        <ConfirmModal
          trigger={
            <Button.Root appearance="ghost" color="neutral" size="sm">
              <Button.Icon icon={RotateCcw} />
              <Button.Title>Reverter</Button.Title>
            </Button.Root>
          }
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
          onSuccess={onChanged}
        />
      )}
    </div>
  );
}
