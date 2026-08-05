import type { QueryFilter } from "@/hooks/useTableData";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { SERIES_BLUE, SERIES_GREEN } from "@/components/Chart/chartTheme";

import {
  buildBarLineOption,
  buildHorizontalBarOption,
  mutedLine,
} from "../../chartBuilders";
import { monthKeyToLabel } from "../../utils";
import { ReportFilters } from "../interface";
import {
  InvoicedByFactoryPoint,
  InvoicedByMonthPoint,
  SalesReportOrder,
} from "./interface";

/**
 * Situações que contam como venda faturada. `invoicedAt` preenchido já exclui o
 * orçamento, mas não o pedido faturado e cancelado depois.
 */
const INVOICED_STATUSES = ["INVOICED", "DELIVERED"];

/**
 * O recorte do relatório: período pela DATA DE FATURAMENTO.
 *
 * É a diferença entre este relatório e o de pedidos enviados — aqui a pergunta é
 * "quanto a fábrica faturou em julho", e um pedido de junho faturado em julho
 * entra em julho. O gráfico usa as agregações `invoiced*`, que recortam pela
 * mesma data: sem isso o topo e o gráfico responderiam coisas diferentes.
 */
export const buildSalesFilters = (filters: ReportFilters): QueryFilter[] => [
  { field: "invoiced_at", operator: "gte", value: filters.from },
  { field: "invoiced_at", operator: "lte", value: filters.to },
  { field: "status_in", operator: "in", values: INVOICED_STATUSES },
  ...(filters.sellerId
    ? [{ field: "seller_id", operator: "eq", value: filters.sellerId }]
    : []),
];

/** Quantos meses o período abrange (1 = o gráfico mensal teria uma barra só). */
export const monthsInRange = (from: string, to: string): number => {
  const [fromYear, fromMonth] = from.split("-").map(Number);
  const [toYear, toMonth] = to.split("-").map(Number);
  return (toYear - fromYear) * 12 + (toMonth - fromMonth) + 1;
};

/**
 * Faturamento por fábrica, em barras horizontais — a leitura do mês fechado:
 * de quem veio o dinheiro. Horizontal porque os rótulos são nomes de fábrica.
 */
export const buildFactoryOption = (
  points: InvoicedByFactoryPoint[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    points.map((point) => point.entityName),
    [
      {
        name: "Faturado",
        color: SERIES_BLUE,
        data: points.map((point) => Number(point.total)),
      },
    ],
    (value) => formatMoney(value),
    (index) => {
      const point = points[index];
      if (!point) return [];
      return [
        point.entityName,
        `Faturado: <b>${formatMoney(point.total)}</b>`,
        mutedLine(
          `${point.orderCount} pedido(s) · comissão ${formatMoney(point.commissionAmount)}`
        ),
      ];
    }
  );

/**
 * Faturamento mês a mês, quando o período abrange mais de um mês: barra para o
 * faturado, linha para a comissão, em eixos separados.
 *
 * A comissão NÃO entra empilhada dentro da barra, ainda que seja parte do
 * faturado: ela roda na casa dos 3%, e dentro de uma barra de dezenas de milhares
 * virava uma linha verde de um pixel — a legenda prometia uma cor que não se via.
 * Em eixo próprio as duas grandezas ficam legíveis, e a comparação que interessa
 * (a comissão acompanhou o faturamento?) fica possível.
 */
export const buildMonthOption = (
  points: InvoicedByMonthPoint[]
): EChartsCoreOption =>
  buildBarLineOption(
    points.map((point) => monthKeyToLabel(point.month)),
    {
      name: "Faturado",
      color: SERIES_BLUE,
      data: points.map((point) => Number(point.total)),
      formatter: (value) => formatMoney(value),
    },
    {
      name: "Comissão",
      color: SERIES_GREEN,
      data: points.map((point) => Number(point.commissionAmount)),
      formatter: (value) => formatMoney(value),
    }
  );

export const SALES_EXPORT_HEADERS = [
  "Faturamento",
  "Data do pedido",
  "Cliente",
  "Fábrica",
  "Vendedor",
  "Situação",
  "Valor",
  "Comissão",
];

/**
 * Linhas da planilha. Os valores vão como NÚMERO, não como texto formatado: a
 * planilha existe para somar e cruzar, e "R$ 4.820,00" em célula de texto não
 * entra em soma.
 */
export const buildSalesExportRows = (
  orders: SalesReportOrder[],
  statusLabel: (status: string) => string
): (string | number)[][] =>
  orders.map((order) => [
    order.invoicedAt ? formatDateDMY(order.invoicedAt) : "—",
    formatDateDMY(order.orderDate),
    clientName(order.client),
    factoryName(order.factory),
    order.seller?.name ?? "—",
    statusLabel(order.status),
    Number(order.totalAmount),
    Number(order.commissionAmount),
  ]);

/** Soma de uma coluna monetária das linhas à vista (rodapé da tabela e do PDF). */
export const sumBy = (
  orders: SalesReportOrder[],
  pick: (order: SalesReportOrder) => string
): number => orders.reduce((total, order) => total + Number(pick(order)), 0);
