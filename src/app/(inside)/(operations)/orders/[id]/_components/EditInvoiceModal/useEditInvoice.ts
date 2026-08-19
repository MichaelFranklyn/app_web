"use client";

import { FormBuilderRef, FormStepSchema } from "@/components/FormBuilder";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { toIsoDate } from "@/utils/format/date";
import { useMutation } from "@apollo/client/react";
import { useMemo, useRef, useState } from "react";

import { OrderDetail } from "../../interface";
import { selectValue } from "../../utils";
import { REVISE_ORDER_INVOICE_MUTATION, UNINVOICE_ORDER_MUTATION } from "./gql";
import { describeSettlements, isSettled } from "./utils";

interface ReviseResponse {
  reviseOrderInvoice: { status: boolean; message: string };
}

interface UninvoiceResponse {
  uninvoiceOrder: { status: boolean; message: string };
}

/** Ação destrutiva aguardando o "tem certeza?" dentro do próprio modal. */
export type PendingAction = "undoDelivery" | "redoInvoice" | null;

/**
 * Correção de um faturamento já lançado. Três operações, da mais leve para a
 * mais pesada: ajustar datas/prazo, desfazer a entrega e refazer o faturamento
 * inteiro (que é o caminho para trocar as quantidades faturadas — ver
 * `uninvoiceOrder` no backend).
 */
export function useEditInvoice(order: OrderDetail, onSuccess: () => void) {
  const [open, setOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [termId, setTermId] = useState<string | null>(order.paymentTermId);
  const formRef = useRef<FormBuilderRef>(null);
  const { execute, isLoading } = useAsyncAction();

  const [reviseInvoice] = useMutation<ReviseResponse>(
    REVISE_ORDER_INVOICE_MUTATION
  );
  const [uninvoiceOrder] = useMutation<UninvoiceResponse>(
    UNINVOICE_ORDER_MUTATION
  );

  const settled = useMemo(
    () => order.installments.filter(isSettled),
    [order.installments]
  );
  const settlementSummary = describeSettlements(settled);

  const paymentTermOptions = useMemo(
    () =>
      order.availablePaymentTerms.map((term) => ({
        label: `${term.name} (${term.installmentsDays.join("/")})`,
        value: term.id,
      })),
    [order.availablePaymentTerms]
  );

  // Trocar por um prazo com outra quantidade de parcelas obriga a refazê-las do
  // zero; as baixas não sobrevivem. Mesma quantidade (ou só a data mudando) o
  // backend corrige no lugar, preservando o que já foi pago/recebido.
  const currentTerm = order.availablePaymentTerms.find(
    (t) => t.id === order.paymentTermId
  );
  const nextTerm = order.availablePaymentTerms.find((t) => t.id === termId);
  const installmentCountChanges =
    (nextTerm?.installmentsDays.length ?? 1) !==
    (currentTerm?.installmentsDays.length ?? 1);
  const willDropSettlements = installmentCountChanges && settled.length > 0;

  const steps: FormStepSchema[] = useMemo(
    () => [
      {
        id: "invoice",
        sections: [
          {
            id: "fields",
            fields: [
              {
                name: "invoicedAt",
                type: "date",
                label: "Data do faturamento",
                required: true,
                hint: "É a data da nota da fábrica. As parcelas contam a partir dela.",
              },
              {
                name: "invoiceNumber",
                type: "text",
                label: "Número da nota fiscal",
                placeholder: "Ex.: 12345",
                hint: "Como está na nota da fábrica. Apaga o campo para tirar uma nota lançada errada; mudar o número não mexe nas parcelas.",
              },
              {
                name: "paymentTermId",
                type: "select-single",
                label: "Prazo de pagamento",
                placeholder: "Selecione o prazo (ex.: 30/60/90)",
                options: paymentTermOptions,
                onChange: (value: unknown) => {
                  const selected = value as { value: string } | null;
                  setTermId(selected?.value ?? null);
                },
              },
              {
                name: "deliveryEstimateDays",
                type: "number",
                label: "Previsão de entrega (dias)",
                hint: "Quantos dias a fábrica leva para entregar, contados do faturamento.",
              },
              // Só aparece com a entrega já confirmada: informar a data num
              // pedido não entregue é confirmar a entrega, e é ela que abastece
              // o estoque do cliente (rotina própria, com outros efeitos).
              ...(order.deliveredAt
                ? [
                    {
                      name: "deliveredAt",
                      type: "date" as const,
                      label: "Data da entrega",
                      hint: "Dia em que a mercadoria chegou na loja do cliente.",
                    },
                  ]
                : []),
            ],
          },
        ],
      },
    ],
    [paymentTermOptions, order.deliveredAt]
  );

  const initialData = useMemo(
    () => ({
      invoicedAt: order.invoicedAt,
      invoiceNumber: order.invoiceNumber ?? "",
      paymentTermId:
        paymentTermOptions.find((opt) => opt.value === order.paymentTermId) ??
        null,
      deliveryEstimateDays: order.deliveryEstimateDays ?? "",
      deliveredAt: order.deliveredAt ?? "",
    }),
    [order, paymentTermOptions]
  );

  const handleClose = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setPendingAction(null);
      setTermId(order.paymentTermId);
      formRef.current?.resetForm();
    }
  };

  const runRevise = async (
    input: Record<string, unknown>,
    successFallback: string
  ) => {
    const res = await reviseInvoice({
      variables: { id: order.id, input },
    });
    if (!res.data?.reviseOrderInvoice?.status) {
      throw new Error(
        res.data?.reviseOrderInvoice?.message ??
          "Erro ao corrigir o faturamento"
      );
    }
    return res.data.reviseOrderInvoice.message || successFallback;
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    const invoicedAt = toIsoDate(data.invoicedAt);
    if (!invoicedAt) throw new Error("Informe a data do faturamento.");

    const selectedTerm = selectValue(data.paymentTermId) || null;
    const invoiceNumber = String(data.invoiceNumber ?? "").trim();
    const days = Number(data.deliveryEstimateDays);
    const deliveredAt = order.deliveredAt ? toIsoDate(data.deliveredAt) : null;

    const input: Record<string, unknown> = {
      invoicedAt,
      // Campo esvaziado = apagar a nota; um nulo sozinho significaria "não mexer".
      ...(invoiceNumber ? { invoiceNumber } : { clearInvoiceNumber: true }),
      // Sem prazo escolhido = à vista; `clearPaymentTerm` é o que diz "apague",
      // já que um nulo sozinho significa "não mexer".
      ...(selectedTerm
        ? { paymentTermId: selectedTerm }
        : { clearPaymentTerm: true }),
      ...(Number.isFinite(days) && days > 0
        ? { deliveryEstimateDays: days }
        : { clearDeliveryEstimate: true }),
      ...(deliveredAt ? { deliveredAt } : {}),
      // O aviso das baixas já está na tela; o botão diz o que vai acontecer.
      ...(willDropSettlements ? { force: true } : {}),
    };

    await execute(() => runRevise(input, "Faturamento corrigido."), {
      successMessage: (message) => message,
      onSuccess: () => {
        handleClose(false);
        onSuccess();
      },
    });
  };

  const undoDelivery = async () => {
    await execute(
      () => runRevise({ clearDelivery: true }, "Entrega desfeita."),
      {
        successMessage: (message) => message,
        onSuccess: () => {
          handleClose(false);
          onSuccess();
        },
      }
    );
  };

  const redoInvoice = async () => {
    await execute(
      async () => {
        const res = await uninvoiceOrder({
          variables: { id: order.id, force: settled.length > 0 },
        });
        if (!res.data?.uninvoiceOrder?.status) {
          throw new Error(
            res.data?.uninvoiceOrder?.message ??
              "Erro ao desfazer o faturamento"
          );
        }
        return res.data.uninvoiceOrder.message;
      },
      {
        successMessage: (message) => message,
        onSuccess: () => {
          handleClose(false);
          onSuccess();
        },
      }
    );
  };

  return {
    open,
    handleClose,
    formRef,
    steps,
    initialData,
    handleSubmit,
    isLoading,
    /** Trocar o prazo apaga as baixas já lançadas. */
    willDropSettlements,
    settlementSummary,
    /** Este pedido teve o restante mandado para um pedido-filho (backorder). */
    hasBackorder: order.backorderChildren.length > 0,
    pendingAction,
    setPendingAction,
    undoDelivery,
    redoInvoice,
  };
}
