import { factoryName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";

/**
 * Os motivos mais comuns de voltar ao cliente. O motivo é opcional — a parada
 * do motor não tem nenhum — e o detalhe vai nas observações.
 */
export const VISIT_REASONS = [
  "Retornar sobre o orçamento",
  "Oferecer reposição de estoque",
  "Apresentar promoção ou lançamento",
  "Confirmar a entrega",
  "Pós-venda",
  "Cobrar pagamento",
  "Combinar uma visita",
];

/**
 * As opções do select. O motivo já gravado que não está na lista (escrito à
 * mão antes de virar lista) entra como opção, para a correção não apagá-lo.
 */
export const reasonOptions = (current?: string | null) => {
  const reasons =
    current && !VISIT_REASONS.includes(current)
      ? [current, ...VISIT_REASONS]
      : VISIT_REASONS;
  return reasons.map((reason) => ({ value: reason, label: reason }));
};

/** "12/08/2026 · NF 1234 · Planalto" — o pedido como quem procura o reconhece. */
export const orderLabel = (order: {
  orderDate: string;
  invoiceNumber: string | null;
  factory?: {
    nickname: string | null;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
}): string =>
  [
    formatDate(order.orderDate),
    order.invoiceNumber ? `NF ${order.invoiceNumber}` : null,
    order.factory ? factoryName(order.factory) : null,
  ]
    .filter((part) => part && part !== "—")
    .join(" · ");
