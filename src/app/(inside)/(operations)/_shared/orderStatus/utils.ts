/**
 * Vocabulário do status do pedido — a mesma palavra em toda a operação.
 *
 * Mora no pai porque duas rotas-irmãs precisam dele: a lista de pedidos e os
 * pedidos do cliente (clients/[id]/orders). O status chega do backend como NOME
 * do enum (CONFIRMED, INVOICED); traduzir isso em cada rota já produziu uma tela
 * com a tag em inglês, porque o mapa local só conhecia parte dos status.
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
