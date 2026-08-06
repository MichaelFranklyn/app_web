import { SERIES_BLUE, SERIES_GREEN } from "@/components/Chart/chartTheme";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { SortLabel } from "@/utils/pdf/context";

import { buildHorizontalBarOption, mutedLine } from "../../chartBuilders";
import { formatPercent } from "../../utils";
import { PositivationFactory, PositivationRow } from "./interface";

export const buildFactoryRateOption = (
  factories: PositivationFactory[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    factories.map((factory) => factory.factoryName),
    [
      {
        name: "Positivaram",
        color: SERIES_GREEN,
        data: factories.map((factory) => factory.positivatedClients),
      },
      {
        name: "Não compraram",
        color: SERIES_BLUE,
        data: factories.map(
          (factory) => factory.linkedClients - factory.positivatedClients
        ),
      },
    ],
    (value) => String(Math.round(value)),
    (index) => {
      const factory = factories[index];
      if (!factory) return [];
      return [
        factory.factoryName,
        `Positivação: <b>${formatPercent(factory.positivationRate)}</b>`,
        `${factory.positivatedClients} de ${factory.linkedClients} cliente(s) vinculado(s)`,
        mutedLine(`Faturado no período: ${formatMoney(factory.totalAmount)}`),
      ];
    },
    { stacked: true }
  );

/** "2 de 3" — como a linha resume a positivação do cliente. */
export const positivatedLabel = (row: PositivationRow): string =>
  `${row.positivatedFactories}/${row.linkedFactories}`;

/**
 * Cabeçalho da planilha: as colunas fixas e uma por fábrica, na mesma ordem da
 * tela. A matriz precisa manter a forma no arquivo — é ela que se lê de relance.
 */
/**
 * Colunas por onde a matriz pode ser ordenada.
 *
 * As colunas de FÁBRICA ficam de fora: cada uma é um visto (comprou/não
 * comprou), e ordenar por um sim/não só agrupa a coluna — o filtro "comprou da
 * fábrica" responde melhor a mesma pergunta.
 */
export const POSITIVATION_SORT_COLUMNS = {
  client: (row: PositivationRow) => row.clientName,
  seller: (row: PositivationRow) => row.sellerName,
  positivated: (row: PositivationRow) => row.positivatedFactories,
  totalAmount: (row: PositivationRow) => Number(row.totalAmount || 0),
  lastOrderDate: (row: PositivationRow) => row.lastOrderDate,
};

/** Como cada coluna ordenável se chama no papel, e em que sentido ela é lida. */
export const POSITIVATION_SORT_LABELS: Record<string, SortLabel> = {
  client: { label: "Cliente", kind: "text" },
  seller: { label: "Vendedor", kind: "text" },
  positivated: { label: "Positivou", kind: "number" },
  totalAmount: { label: "Valor no período", kind: "number" },
  lastOrderDate: { label: "Última compra", kind: "date" },
};

export const buildPositivationHeaders = (
  factories: PositivationFactory[]
): string[] => [
  "Cliente",
  "Vendedor",
  ...factories.map((factory) => factory.factoryName),
  "Positivou",
  "Pedidos",
  "Valor no período",
  "Última compra",
];

/**
 * Linhas da planilha, preservando a matriz.
 *
 * A célula usa palavra, não símbolo: "Sim"/"Não" para o vínculo que existe e vazio
 * para o que não existe. Um "✓" viaja mal entre Excel e Google Sheets, e "não
 * vinculado" precisa se distinguir de "vinculado e não comprou" — que é a única
 * célula sobre a qual há o que fazer.
 */
export const buildPositivationExportRows = (
  rows: PositivationRow[],
  factories: PositivationFactory[]
): (string | number)[][] =>
  rows.map((row) => {
    const byFactory = new Map(row.cells.map((cell) => [cell.factoryId, cell]));
    return [
      row.clientName,
      row.sellerName,
      ...factories.map((factory) => {
        const cell = byFactory.get(factory.factoryId);
        if (!cell?.isLinked) return "";
        return cell.isPositivated ? "Sim" : "Não";
      }),
      positivatedLabel(row),
      row.orderCount,
      Number(row.totalAmount),
      row.lastOrderDate ? formatDateDMY(row.lastOrderDate) : "—",
    ];
  });

/** Fechamento do recorte à vista (a tabela pode estar filtrada por escopo). */
export interface PositivationTotals {
  clients: number;
  positivated: number;
  zeroed: number;
  amount: number;
}

export const summarizeRows = (rows: PositivationRow[]): PositivationTotals => {
  const positivated = rows.filter((row) => row.positivatedFactories > 0).length;
  return {
    clients: rows.length,
    positivated,
    zeroed: rows.length - positivated,
    amount: rows.reduce((total, row) => total + Number(row.totalAmount), 0),
  };
};
