import { SERIES_BLUE, SERIES_GREEN } from "@/components/Chart/chartTheme";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../chartBuilders";
import { formatPercent } from "../../utils";
import {
  PositivationFactory,
  PositivationRow,
  PositivationScope,
} from "./interface";

export const POSITIVATION_SCOPES: {
  id: PositivationScope;
  label: string;
}[] = [
  { id: "all", label: "Toda a carteira" },
  { id: "positivated", label: "Positivaram" },
  { id: "zeroed", label: "Zerados" },
];

/**
 * Recorta as linhas pelo escopo escolhido.
 *
 * "Zerados" é o recorte que faz o relatório valer a viagem: é a lista de quem
 * está na carteira e não comprou nada no período — quem precisa de visita.
 */
export const filterByScope = (
  rows: PositivationRow[],
  scope: PositivationScope
): PositivationRow[] => {
  if (scope === "positivated") {
    return rows.filter((row) => row.positivatedFactories > 0);
  }
  if (scope === "zeroed") {
    return rows.filter((row) => row.positivatedFactories === 0);
  }
  return rows;
};

/**
 * Taxa de positivação por fábrica, em barras horizontais.
 *
 * As duas séries somam os clientes VINCULADOS àquela fábrica: verde comprou, azul
 * não. Assim a barra inteira é o tamanho da carteira naquela fábrica — sem isso,
 * uma fábrica com 2 vínculos e 100% pareceria melhor que outra com 50 e 60%.
 */
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

/** Texto do recorte para o cabeçalho do documento, quando não é a carteira toda. */
export const scopeContextLine = (scope: PositivationScope): string | null => {
  if (scope === "positivated") return "Somente: clientes que positivaram";
  if (scope === "zeroed") return "Somente: clientes zerados";
  return null;
};
