/**
 * Vocabulário do status do pedido — a mesma palavra em todo o sistema.
 *
 * Subiu de `(operations)/_shared` para cá quando os relatórios do dashboard
 * passaram a precisar dele: código compartilhado mora no pai comum, e o pai
 * comum de `(operations)` e `dashboard` é este. O status chega do backend como
 * NOME do enum (CONFIRMED, INVOICED); traduzir isso em cada rota já produziu uma
 * tela com a tag em inglês, porque o mapa local só conhecia parte dos status.
 */
export type OrderStatus =
  | "DRAFT"
  | "SENT"
  | "CONFIRMED"
  | "INVOICED"
  | "DELIVERED"
  | "CANCELLED";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "Orçamento",
  SENT: "Orçamento enviado",
  CONFIRMED: "Confirmado",
  INVOICED: "Faturado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

/**
 * Opções do filtro "Situação", na ordem em que o pedido caminha — de orçamento
 * a entregue, com o cancelado no fim. É a mesma palavra que aparece na coluna
 * Situação da tabela, para o filtro e a linha não se contradizerem.
 */
export const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = (
  [
    "DRAFT",
    "SENT",
    "CONFIRMED",
    "INVOICED",
    "DELIVERED",
    "CANCELLED",
  ] as OrderStatus[]
).map((status) => ({ value: status, label: ORDER_STATUS_LABELS[status] }));

/** Cor do Badge por status: o que ainda dá trabalho fica em destaque. */
export const ORDER_STATUS_TONE: Record<
  OrderStatus,
  "subtle" | "neutral" | "blue" | "green" | "red"
> = {
  DRAFT: "subtle",
  SENT: "subtle",
  CONFIRMED: "blue",
  INVOICED: "neutral",
  DELIVERED: "green",
  CANCELLED: "red",
};

/**
 * Rótulo tolerante a status desconhecido: usado onde o campo chega como string
 * solta da query (sem o tipo `OrderStatus`). Um status novo no backend aparece
 * cru em vez de sumir — mas aparece, e o mapa acima é o lugar de traduzi-lo.
 */
export const orderStatusLabel = (status: string): string =>
  ORDER_STATUS_LABELS[status as OrderStatus] ?? status;

export const orderStatusTone = (status: string) =>
  ORDER_STATUS_TONE[status as OrderStatus] ?? "neutral";

/**
 * O pedido ainda é um ORÇAMENTO?
 *
 * Orçamento não é um status próprio: é o pedido em `DRAFT` ou `SENT` — ele
 * reusa os dois primeiros degraus da esteira e passa a ser pedido ao ser
 * confirmado. A regra vivia escrita à mão em três telas (cabeçalho do detalhe,
 * ficha em PDF e a barra do valor mínimo); no dia em que ela mudar, três
 * lugares divergem e a mesma tela chama a mesma coisa por dois nomes. Aqui é o
 * lugar: quem já é dono do vocabulário do status é dono também de quem é quem.
 *
 * Aceita `string` porque o campo chega solto da query em quase todo consumidor.
 */
export const isQuoteStatus = (status: string): boolean =>
  status === "DRAFT" || status === "SENT";
