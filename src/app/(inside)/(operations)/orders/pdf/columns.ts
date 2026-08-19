import { clientName, factoryName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";
import { Order } from "../interface";
import { orderStatusLabel } from "../utils";

/**
 * Colunas do relatório de pedidos: as MESMAS oito da tela, na mesma ordem — quem
 * imprime está conferindo contra o que viu, e uma coluna a mais no papel faz a
 * conferência procurar na tabela um dado que não está lá (era o caso da data de
 * faturamento).
 *
 * O número do pedido é o prefixo do id (os mesmos 8 caracteres que a tela e o
 * PDF do pedido exibem): é por ele que se acha o pedido no sistema depois.
 */
export const ORDER_COLUMNS: ReportColumn<Order>[] = [
  {
    header: "PEDIDO",
    width: 8,
    value: (order) => order.id.slice(0, 8).toUpperCase(),
  },
  {
    header: "CLIENTE",
    width: 24,
    value: (order) => clientName(order.client),
    sub: (order) => order.client?.nomeFantasia ?? null,
  },
  {
    header: "FÁBRICA",
    width: 15,
    value: (order) => factoryName(order.factory),
  },
  {
    header: "VENDEDOR",
    width: 13,
    value: (order) => order.seller?.name ?? "—",
  },
  { header: "DATA", width: 9, value: (order) => formatDate(order.orderDate) },
  {
    header: "SITUAÇÃO",
    width: 10,
    value: (order) => orderStatusLabel(order.status),
  },
  {
    // Mercadoria, sem IPI nem imposto embutido — a mesma base da coluna da tela
    // e do cálculo da comissão.
    header: "VALOR S/ IMP.",
    width: 11,
    align: "right",
    bold: true,
    value: (order) => formatMoney(order.totalAmount),
  },
  {
    header: "COMISSÃO",
    width: 10,
    align: "right",
    value: (order) => formatMoney(order.commissionAmount),
  },
];

/** Índices das colunas de dinheiro, para a linha de totais cair sob elas. */
const COMMISSION_INDEX = ORDER_COLUMNS.findIndex(
  (column) => column.header === "COMISSÃO"
);
const AMOUNT_INDEX = ORDER_COLUMNS.findIndex(
  (column) => column.header === "VALOR S/ IMP."
);

const sum = (orders: Order[], pick: (order: Order) => string): number =>
  orders.reduce((total, order) => total + Number(pick(order) || 0), 0);

/**
 * Linha de fechamento: quanto o recorte impresso soma em valor e em comissão.
 *
 * Os totais saem das linhas exportadas, não dos KPIs do topo da tela — assim o
 * papel fecha consigo mesmo, mesmo que a tela tenha mudado de filtro depois.
 */
export const buildOrderTotals = (
  orders: Order[]
): Partial<Record<number, string>> => ({
  [COMMISSION_INDEX]: formatMoney(
    sum(orders, (order) => order.commissionAmount)
  ),
  [AMOUNT_INDEX]: formatMoney(sum(orders, (order) => order.totalAmount)),
});
