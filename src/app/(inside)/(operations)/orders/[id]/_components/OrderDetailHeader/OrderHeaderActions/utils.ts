import {
  canDeleteOrder,
  isQuoteStatus,
} from "@/app/(inside)/_shared/orderStatus";

/** O mínimo do pedido que decide quais ações o cabeçalho oferece. */
export interface OrderActionState {
  status: string;
  sentAt?: string | null;
  invoicedAt?: string | null;
  deliveredAt?: string | null;
}

/** A próxima etapa do pedido: vira o único botão âmbar do cabeçalho. */
export type PrimaryAction = "convert" | "send" | "invoice" | "deliver" | null;

/** O que pode ser feito no pedido agora, independente de onde aparece. */
export function availableActions(order: OrderActionState) {
  const isCancelled = order.status === "CANCELLED";
  const isQuote = isQuoteStatus(order.status);
  const isInvoiced = !!order.invoicedAt;

  return {
    convert: isQuote,
    // Só até o faturamento: se a fábrica emitiu a nota, ela recebeu o pedido.
    send: !isInvoiced && !isCancelled,
    invoice: !isInvoiced && !isCancelled && !isQuote,
    // Faturar ≠ entregar: a chegada na loja é o que reabastece o estoque.
    deliver: isInvoiced && !order.deliveredAt && !isCancelled,
    // Faturamento é lançamento manual: corrigir não pode exigir apagar.
    editInvoice: isInvoiced && !isCancelled,
    scheduleReturn: !isCancelled,
    // Faturado tem boletos e comissão: o caminho é desfazer o faturamento.
    cancel: !isInvoiced && !isCancelled && order.status !== "DELIVERED",
    delete: canDeleteOrder(order.status, order.invoicedAt),
  };
}

/**
 * A ação principal segue a ordem do fluxo: orçamento → pedido → fábrica →
 * nota → entrega. Quem abre o pedido vê, em âmbar, só o próximo passo; o resto
 * continua a um clique, no "Mais ações".
 */
export function pickPrimaryAction(order: OrderActionState): PrimaryAction {
  const can = availableActions(order);
  if (can.convert) return "convert";
  if (can.deliver) return "deliver";
  if (can.send && !order.sentAt) return "send";
  if (can.invoice) return "invoice";
  return null;
}
