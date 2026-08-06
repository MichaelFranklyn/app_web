import { SERIES_BLUE, SERIES_GREEN } from "@/components/Chart/chartTheme";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { SortLabel } from "@/utils/pdf/context";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../chartBuilders";
import { formatPercent } from "../../utils";
import { safeRate } from "../utils";
import { FactoryOrdersRow } from "./interface";

export const sumBy = (
  rows: FactoryOrdersRow[],
  pick: (row: FactoryOrdersRow) => string | number
): number => rows.reduce((total, row) => total + Number(pick(row) || 0), 0);

/** Quanto do que foi colocado na fábrica ela já faturou. */
export const invoicedRate = (row: FactoryOrdersRow): number =>
  safeRate(Number(row.invoicedAmount || 0), Number(row.totalAmount || 0));

/**
 * Colocado × faturado por fábrica.
 *
 * As duas barras ficam LADO A LADO, e não empilhadas: o faturado é uma PARTE do
 * colocado, não uma parcela que se soma a ele — empilhar mostraria uma barra do
 * dobro do tamanho e faria a fábrica parecer ter recebido o dobro do pedido. A
 * distância entre as duas é a leitura: o que ainda não voltou.
 */
export const buildFactoryOption = (
  rows: FactoryOrdersRow[]
): EChartsCoreOption => {
  const top = rows.slice(0, 10);
  return buildHorizontalBarOption(
    top.map((row) => row.entityName),
    [
      {
        name: "Colocado",
        color: SERIES_BLUE,
        data: top.map((row) => Number(row.totalAmount || 0)),
      },
      {
        name: "Já faturado",
        color: SERIES_GREEN,
        data: top.map((row) => Number(row.invoicedAmount || 0)),
      },
    ],
    (value) => formatMoney(value),
    (index) => {
      const row = top[index];
      if (!row) return [];
      return [
        row.entityName,
        `Colocado: <b>${formatMoney(row.totalAmount)}</b> em ${row.orderCount} pedido(s)`,
        `Já faturado: <b>${formatMoney(row.invoicedAmount)}</b> (${formatPercent(invoicedRate(row))})`,
        mutedLine(`Ticket médio: ${formatMoney(row.avgTicket)}`),
        mutedLine(`${row.clientCount} cliente(s) atendido(s)`),
      ];
    }
  );
};

/**
 * Colunas por onde as fábricas podem ser ordenadas.
 *
 * A ordem natural é por valor colocado (o backend já devolve assim), que é a
 * pergunta de sempre; as outras respondem "quem tem mais clientes", "quem
 * demora a faturar", "quem rende mais por pedido".
 */
export const FACTORIES_SORT_COLUMNS = {
  factory: (row: FactoryOrdersRow) => row.entityName,
  orderCount: (row: FactoryOrdersRow) => row.orderCount,
  clientCount: (row: FactoryOrdersRow) => row.clientCount,
  totalAmount: (row: FactoryOrdersRow) => Number(row.totalAmount || 0),
  avgTicket: (row: FactoryOrdersRow) => Number(row.avgTicket || 0),
  invoicedAmount: (row: FactoryOrdersRow) => Number(row.invoicedAmount || 0),
  commissionAmount: (row: FactoryOrdersRow) =>
    Number(row.commissionAmount || 0),
  lastOrderDate: (row: FactoryOrdersRow) => row.lastOrderDate,
};

/** Como cada coluna ordenável se chama no papel, e em que sentido ela é lida. */
export const FACTORIES_SORT_LABELS: Record<string, SortLabel> = {
  factory: { label: "Fábrica", kind: "text" },
  orderCount: { label: "Pedidos", kind: "number" },
  clientCount: { label: "Clientes", kind: "number" },
  totalAmount: { label: "Valor colocado", kind: "number" },
  avgTicket: { label: "Ticket médio", kind: "number" },
  invoicedAmount: { label: "Já faturado", kind: "number" },
  commissionAmount: { label: "Comissão", kind: "number" },
  lastOrderDate: { label: "Último pedido", kind: "date" },
};

export const FACTORY_EXPORT_HEADERS = [
  "Fábrica",
  "Pedidos",
  "Valor colocado",
  "Ticket médio",
  "Clientes",
  "Pedidos faturados",
  "Valor faturado",
  "% faturado",
  "Comissão",
  "Último pedido",
  "% do período",
];

export const buildFactoryExportRows = (
  rows: FactoryOrdersRow[]
): (string | number)[][] =>
  rows.map((row) => [
    row.entityName,
    row.orderCount,
    Number(row.totalAmount || 0),
    Number(row.avgTicket || 0),
    row.clientCount,
    row.invoicedCount,
    Number(row.invoicedAmount || 0),
    formatPercent(invoicedRate(row)),
    Number(row.commissionAmount || 0),
    row.lastOrderDate ? formatDateDMY(row.lastOrderDate) : "—",
    formatPercent(row.share),
  ]);
