"use client";

import { ConfirmModal } from "@/components/ConfirmModal";
import { MoreOptions } from "@/components/MoreOptions";
import { useMutation } from "@apollo/client/react";
import {
  Ban,
  BadgeCheck,
  CircleDollarSign,
  HandCoins,
  RotateCcw,
  Undo2,
} from "lucide-react";
import { useState } from "react";
import {
  MARK_INSTALLMENTS_DEFAULTED_MUTATION,
  MARK_SELLER_COMMISSION_PAID_MUTATION,
  PAY_ORDER_INSTALLMENTS_MUTATION,
  REVERT_ORDER_INSTALLMENT_MUTATION,
  UNMARK_COMMISSION_RECEIVED_MUTATION,
  UNMARK_SELLER_COMMISSION_PAID_MUTATION,
} from "../../gql";
import { CommissionRow } from "../../interface";
import { DateActionModal } from "../DateActionModal";
import { MarkReceivedModal } from "../MarkReceivedModal";

interface StatusResponse {
  status: boolean;
  message: string;
}

/** Qual modal com data está aberto nesta linha. */
type OpenModal = "received" | "paid" | "defaulted" | "sellerPaid" | null;

/**
 * Ações de uma linha de comissão, num menu só.
 *
 * A coluna trazia apenas "Recebi" e um traço para todo o resto — as outras
 * ações (baixar o boleto, marcar calote, registrar o repasse) só existiam na
 * seleção em lote, e desfazer não existia em lugar nenhum. Aqui cada linha
 * oferece o que faz sentido para o estado dela, e todo lançamento tem o seu
 * inverso: quem lança errado precisa conseguir voltar.
 */
export function CommissionRowActions({
  row,
  onChanged,
}: {
  row: CommissionRow;
  onChanged: () => void;
}) {
  const [openModal, setOpenModal] = useState<OpenModal>(null);
  const [confirm, setConfirm] = useState<
    "unreceive" | "unpaid" | "revert" | null
  >(null);

  const ids = [row.installmentId];
  const [payInstallments] = useMutation<{
    payOrderInstallments: StatusResponse;
  }>(PAY_ORDER_INSTALLMENTS_MUTATION);
  const [markDefaulted] = useMutation<{
    markOrderInstallmentsDefaulted: StatusResponse;
  }>(MARK_INSTALLMENTS_DEFAULTED_MUTATION);
  const [markSellerPaid] = useMutation<{
    markSellerCommissionPaid: StatusResponse;
  }>(MARK_SELLER_COMMISSION_PAID_MUTATION);
  const [unmarkReceived] = useMutation<{
    unmarkCommissionReceived: StatusResponse;
  }>(UNMARK_COMMISSION_RECEIVED_MUTATION);
  const [unmarkSellerPaid] = useMutation<{
    unmarkSellerCommissionPaid: StatusResponse;
  }>(UNMARK_SELLER_COMMISSION_PAID_MUTATION);
  const [revertInstallment] = useMutation<{
    revertOrderInstallment: StatusResponse;
  }>(REVERT_ORDER_INSTALLMENT_MUTATION);

  const boletoEmAberto = !row.paidAt && !row.defaultedAt;

  const options = [
    ...(row.isReceivable
      ? [
          {
            label: "Recebi da fábrica",
            icon: BadgeCheck,
            onClick: () => setOpenModal("received"),
          },
        ]
      : []),
    ...(row.isReceived
      ? [
          {
            label: "Não recebi da fábrica",
            icon: Undo2,
            onClick: () => setConfirm("unreceive"),
          },
        ]
      : []),
    ...(boletoEmAberto
      ? [
          {
            label: "Cliente pagou o boleto",
            icon: CircleDollarSign,
            onClick: () => setOpenModal("paid"),
          },
          {
            label: "Cliente não pagou",
            icon: Ban,
            danger: true,
            onClick: () => setOpenModal("defaulted"),
          },
        ]
      : [
          {
            label: "Reverter boleto para em aberto",
            icon: RotateCcw,
            onClick: () => setConfirm("revert"),
          },
        ]),
    ...(row.isSellerPaid
      ? [
          {
            label: "Desfazer repasse ao vendedor",
            icon: Undo2,
            onClick: () => setConfirm("unpaid"),
          },
        ]
      : [
          {
            label: "Repassei ao vendedor",
            icon: HandCoins,
            onClick: () => setOpenModal("sellerPaid"),
          },
        ]),
  ];

  const run = async (
    fn: () => Promise<{ data?: Record<string, StatusResponse | undefined> }>,
    key: string,
    erro: string
  ) => {
    const res = await fn();
    const payload = res.data?.[key];
    if (!payload?.status) throw new Error(payload?.message ?? erro);
  };

  return (
    <>
      <MoreOptions options={options} />

      <MarkReceivedModal
        installmentIds={ids}
        open={openModal === "received"}
        onOpenChange={(v) => setOpenModal(v ? "received" : null)}
        onSuccess={onChanged}
      />

      <DateActionModal
        label="Cliente pagou"
        icon={CircleDollarSign}
        color="green"
        open={openModal === "paid"}
        onOpenChange={(v) => setOpenModal(v ? "paid" : null)}
        title={`Baixar o boleto ${row.sequence}`}
        description="Registra o pagamento do cliente. A data define em qual repasse a comissão entra."
        dateLabel="Data do pagamento"
        dateHint="Dia em que o cliente pagou — um boleto pago com atraso cai no fechamento seguinte."
        confirmLabel="Confirmar pagamento"
        successMessage="Boleto baixado"
        onConfirm={(paidAt) =>
          run(
            () =>
              payInstallments({
                variables: { installmentIds: ids, paidAt },
              }) as never,
            "payOrderInstallments",
            "Erro ao baixar o boleto"
          )
        }
        onSuccess={onChanged}
      />

      <DateActionModal
        label="Cliente não pagou"
        icon={Ban}
        color="red"
        open={openModal === "defaulted"}
        onOpenChange={(v) => setOpenModal(v ? "defaulted" : null)}
        title={`Marcar o boleto ${row.sequence} como inadimplente`}
        description="O cliente não pagou. A comissão deixa de ser devida e, se já tiver sido paga, volta como estorno no fechamento seguinte."
        dateLabel="Data da inadimplência"
        dateHint="Quando o calote foi confirmado — define em qual fechamento o estorno entra."
        confirmLabel="Marcar inadimplente"
        successMessage="Boleto marcado como inadimplente"
        onConfirm={(defaultedAt) =>
          run(
            () =>
              markDefaulted({
                variables: { installmentIds: ids, defaultedAt },
              }) as never,
            "markOrderInstallmentsDefaulted",
            "Erro ao marcar inadimplência"
          )
        }
        onSuccess={onChanged}
      />

      <DateActionModal
        label="Repassei ao vendedor"
        icon={HandCoins}
        color="neutral"
        open={openModal === "sellerPaid"}
        onOpenChange={(v) => setOpenModal(v ? "sellerPaid" : null)}
        title="Registrar repasse ao vendedor"
        description="Registra que o escritório pagou ao vendedor a fatia dele desta parcela."
        dateLabel="Data do repasse"
        dateHint="Dia em que o vendedor recebeu."
        confirmLabel="Confirmar repasse"
        successMessage="Repasse registrado"
        onConfirm={(paidAt) =>
          run(
            () =>
              markSellerPaid({
                variables: { installmentIds: ids, paidAt },
              }) as never,
            "markSellerCommissionPaid",
            "Erro ao registrar o repasse"
          )
        }
        onSuccess={onChanged}
      />

      <ConfirmModal
        open={confirm === "unreceive"}
        onOpenChange={(v) => setConfirm(v ? "unreceive" : null)}
        title="Desfazer o recebimento"
        description="A comissão volta para 'a receber' da fábrica. A conferência contra a planilha continua marcada."
        confirmLabel="Desfazer recebimento"
        successMessage="Comissão voltou para a receber"
        onConfirm={() =>
          run(
            () =>
              unmarkReceived({ variables: { installmentIds: ids } }) as never,
            "unmarkCommissionReceived",
            "Erro ao desfazer o recebimento"
          )
        }
        onSuccess={onChanged}
      />

      <ConfirmModal
        open={confirm === "unpaid"}
        onOpenChange={(v) => setConfirm(v ? "unpaid" : null)}
        title="Desfazer o repasse ao vendedor"
        description="A fatia volta a constar como não repassada. Um estorno agendado nesta parcela é cancelado junto."
        confirmLabel="Desfazer repasse"
        successMessage="Repasse desfeito"
        onConfirm={() =>
          run(
            () =>
              unmarkSellerPaid({ variables: { installmentIds: ids } }) as never,
            "unmarkSellerCommissionPaid",
            "Erro ao desfazer o repasse"
          )
        }
        onSuccess={onChanged}
      />

      <ConfirmModal
        open={confirm === "revert"}
        onOpenChange={(v) => setConfirm(v ? "revert" : null)}
        title={`Reverter o boleto ${row.sequence}`}
        description="Volta o boleto para em aberto, desfazendo o pagamento ou a inadimplência."
        confirmLabel="Reverter"
        successMessage="Boleto voltou para em aberto"
        onConfirm={() =>
          run(
            () =>
              revertInstallment({
                variables: { id: row.installmentId },
              }) as never,
            "revertOrderInstallment",
            "Erro ao reverter o boleto"
          )
        }
        onSuccess={onChanged}
      />
    </>
  );
}
