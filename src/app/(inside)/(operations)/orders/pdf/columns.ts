import { clientName, factoryName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { ReportColumn } from "@/utils/pdf/table";
import { Order } from "../interface";
import { orderStatusLabel } from "../utils";

/**
 * Colunas do relatório de pedidos, na ordem em que a tabela da tela as mostra —
 * quem imprime está conferindo contra o que viu.
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
  { header: "DATA", width: 8, value: (order) => formatDate(order.orderDate) },
  {
    header: "CLIENTE",
    width: 20,
    value: (order) => clientName(order.client),
    sub: (order) => order.client?.nomeFantasia ?? null,
  },
  {
    header: "FÁBRICA",
    width: 14,
    value: (order) => factoryName(order.factory),
  },
  {
    header: "VENDEDOR",
    width: 12,
    value: (order) => order.seller?.name ?? "—",
  },
  {
    header: "SITUAÇÃO",
    width: 10,
    value: (order) => orderStatusLabel(order.status),
  },
  {
    header: "FATURADO",
    width: 8,
    value: (order) => formatDate(order.invoicedAt),
  },
  {
    header: "COMISSÃO",
    width: 9,
    align: "right",
    value: (order) => formatMoney(order.commissionAmount),
  },
  {
    header: "VALOR",
    width: 11,
    align: "right",
    bold: true,
    value: (order) => formatMoney(order.totalAmount),
  },
];

/** Índices das colunas de dinheiro, para a linha de totais cair sob elas. */
const COMMISSION_INDEX = ORDER_COLUMNS.findIndex(
  (column) => column.header === "COMISSÃO"
);
const AMOUNT_INDEX = ORDER_COLUMNS.findIndex(
  (column) => column.header === "VALOR"
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
