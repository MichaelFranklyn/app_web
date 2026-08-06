import { SERIES_BLUE, SERIES_GREEN } from "@/components/Chart/chartTheme";
import type { QueryFilter } from "@/hooks/useTableData";
import type { FieldConfig } from "@/hooks/useTableFilters";
import type { SortLabel } from "@/utils/pdf/context";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../chartBuilders";
import { ReportFilters } from "../interface";
import { PLACED_ORDER_STATUSES } from "../utils";
import { PlacedByFactoryPoint, SentOrder } from "./interface";

/**
 * O recorte: pedidos COLOCADOS no período, pela data do pedido.
 *
 * Difere do relatório de Vendas em duas coisas, e as duas importam: a data é a do
 * pedido (o que foi mandado no período, não o que foi faturado nele) e entram
 * também os pedidos que a fábrica ainda não faturou — que são justamente o que
 * este papel serve para cobrar.
 */
export const buildSentOrdersFilters = (
  filters: ReportFilters
): QueryFilter[] => [
  { field: "order_date", operator: "gte", value: filters.from },
  { field: "order_date", operator: "lte", value: filters.to },
  { field: "status_in", operator: "in", values: PLACED_ORDER_STATUSES },
  ...(filters.sellerId
    ? [{ field: "seller_id", operator: "eq", value: filters.sellerId }]
    : []),
];

/**
 * Campos do painel que viram filtro NA QUERY (a tabela pagina no servidor).
 *
 * `search` é a busca livre que o backend já oferece em pedidos: fábrica, vendedor
 * ou código do pedido — não o nome do cliente, e o rótulo do campo diz isso.
 */
export const SENT_ORDERS_TABLE_FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "search" },
  status: { type: "select", queryField: "status" },
};

/**
 * Colunas de `orders` por onde a lista pode ser ordenada.
 *
 * Cliente, fábrica e vendedor ficam de fora: na tabela `orders` são só o UUID da
 * chave estrangeira.
 */
export const SENT_ORDERS_SORTABLE_FIELDS = [
  "order_date",
  "invoiced_at",
  "status",
  "total_amount",
];

/** Como cada coluna ordenável se chama no papel, e em que sentido ela é lida. */
export const SENT_ORDERS_SORT_LABELS: Record<string, SortLabel> = {
  order_date: { label: "Data do pedido", kind: "date" },
  invoiced_at: { label: "Faturamento", kind: "date" },
  status: { label: "Situação", kind: "text" },
  total_amount: { label: "Valor", kind: "number" },
};

/** Um pedido está pendente na fábrica enquanto ela não o faturou. */
export const isPendingAtFactory = (order: SentOrder): boolean =>
  !order.invoicedAt;

/**
 * Colocado × já faturado por fábrica, em barras empilhadas horizontais.
 *
 * Empilhado porque as duas partes somam o total colocado: a barra inteira é o que
 * foi mandado, e o pedaço claro, o que ainda está esperando faturamento. É a
 * leitura que responde "qual fábrica está me segurando".
 */
export const buildPlacedByFactoryOption = (
  points: PlacedByFactoryPoint[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    points.map((point) => point.entityName),
    [
      {
        name: "Já faturado",
        color: SERIES_GREEN,
        data: points.map((point) => Number(point.invoicedAmount)),
      },
      {
        name: "Aguardando faturamento",
        color: SERIES_BLUE,
        data: points.map(
          (point) => Number(point.total) - Number(point.invoicedAmount)
        ),
      },
    ],
    (value) => formatMoney(value),
    (index) => {
      const point = points[index];
      if (!point) return [];
      const pending = point.orderCount - point.invoicedCount;
      return [
        point.entityName,
        `Colocado: <b>${formatMoney(point.total)}</b> em ${point.orderCount} pedido(s)`,
        `Já faturado: <b>${formatMoney(point.invoicedAmount)}</b> (${point.invoicedCount})`,
        mutedLine(
          pending > 0
            ? `${pending} pedido(s) ainda na fábrica`
            : "nada pendente nesta fábrica"
        ),
      ];
    },
    { stacked: true }
  );

export const SENT_ORDERS_EXPORT_HEADERS = [
  "Data do pedido",
  "Cliente",
  "Fábrica",
  "Vendedor",
  "Situação",
  "Faturamento",
  "Valor",
  "Comissão",
];

export const buildSentOrdersExportRows = (
  orders: SentOrder[],
  statusLabel: (status: string) => string
): (string | number)[][] =>
  orders.map((order) => [
    formatDateDMY(order.orderDate),
    clientName(order.client),
    factoryName(order.factory),
    order.seller?.name ?? "—",
    statusLabel(order.status),
    // Traço quando a fábrica ainda não faturou: o pedido existe, a data não.
    order.invoicedAt ? formatDateDMY(order.invoicedAt) : "—",
    Number(order.totalAmount),
    Number(order.commissionAmount),
  ]);

export interface SentOrdersTotals {
  count: number;
  amount: number;
  invoicedCount: number;
  invoicedAmount: number;
  pendingCount: number;
  pendingAmount: number;
}

/**
 * Fecha o conjunto de linhas em colocado × faturado × pendente. Calculado sobre
 * as linhas de verdade (não sobre os KPIs da tela) para o arquivo fechar consigo
 * mesmo — é ele que vai para a reunião.
 */
export const summarizeSentOrders = (orders: SentOrder[]): SentOrdersTotals => {
  const totals: SentOrdersTotals = {
    count: orders.length,
    amount: 0,
    invoicedCount: 0,
    invoicedAmount: 0,
    pendingCount: 0,
    pendingAmount: 0,
  };

  for (const order of orders) {
    const amount = Number(order.totalAmount);
    totals.amount += amount;
    if (isPendingAtFactory(order)) {
      totals.pendingCount += 1;
      totals.pendingAmount += amount;
    } else {
      totals.invoicedCount += 1;
      totals.invoicedAmount += amount;
    }
  }

  return totals;
};
