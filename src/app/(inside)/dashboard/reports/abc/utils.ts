import { SERIES_BLUE, SERIES_GREEN } from "@/components/Chart/chartTheme";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildBarLineOption, mutedLine } from "../../chartBuilders";
import { formatPercent } from "../../utils";
import { AbcClass, AbcRow, AbcScope } from "./interface";

export const ABC_CLASS_LABEL: Record<AbcClass, string> = {
  A: "Classe A",
  B: "Classe B",
  C: "Classe C",
};

/** O que cada classe significa em uma linha, para o cartão e o tooltip. */
export const ABC_CLASS_HINT: Record<AbcClass, string> = {
  A: "os que somam os primeiros 80% do faturamento",
  B: "os seguintes, até 95%",
  C: "a cauda: os últimos 5%",
};

export const ABC_CLASS_COLOR: Record<AbcClass, "green" | "blue" | "subtle"> = {
  A: "green",
  B: "blue",
  C: "subtle",
};

export const ABC_SCOPES: { value: AbcScope; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "A", label: "Classe A" },
  { value: "B", label: "Classe B" },
  { value: "C", label: "Classe C" },
];

export const filterByScope = (rows: AbcRow[], scope: AbcScope): AbcRow[] =>
  scope === "all" ? rows : rows.filter((row) => row.abcClass === scope);

export const sumBy = (
  rows: AbcRow[],
  pick: (row: AbcRow) => string | number
): number => rows.reduce((total, row) => total + Number(pick(row) || 0), 0);

/** Quantos clientes há em cada classe, e quanto cada classe fatura. */
export const summarizeByClass = (rows: AbcRow[]) => {
  const empty = () => ({ clients: 0, amount: 0 });
  const totals: Record<AbcClass, { clients: number; amount: number }> = {
    A: empty(),
    B: empty(),
    C: empty(),
  };
  for (const row of rows) {
    const entry = totals[row.abcClass];
    entry.clients += 1;
    entry.amount += Number(row.totalAmount || 0);
  }
  return totals;
};

/**
 * A curva de Pareto: barra = o que cada cliente fatura, linha = o acumulado.
 *
 * As duas grandezas não são comparáveis (dinheiro × porcentagem), por isso
 * eixos separados. A leitura é onde a linha cruza os 80%: quanto mais à
 * esquerda, mais concentrada — e mais frágil — é a carteira.
 *
 * Só os 30 primeiros entram no desenho: a cauda vira uma faixa rasteira e
 * ilegível de centenas de barras de um pixel, e ela já está inteira na tabela,
 * que é o lugar de conferi-la.
 */
export const CURVE_CHART_LIMIT = 30;

export const buildCurveOption = (rows: AbcRow[]): EChartsCoreOption => {
  const top = rows.slice(0, CURVE_CHART_LIMIT);
  return buildBarLineOption(
    top.map((row) => row.clientName),
    {
      name: "Faturamento",
      color: SERIES_BLUE,
      data: top.map((row) => Number(row.totalAmount || 0)),
      formatter: (value) => formatMoney(value),
    },
    {
      name: "Acumulado",
      color: SERIES_GREEN,
      data: top.map((row) => row.cumulativeShare * 100),
      formatter: (value) => `${Math.round(value)}%`,
    },
    { lineMax: 100 }
  );
};

/**
 * O ranking em barras, com a classe carregando a cor. Serve quando o período
 * tem poucos clientes e a curva acumulada não tem o que dizer.
 */
export const abcTooltipLines = (row: AbcRow | undefined): string[] => {
  if (!row) return [];
  return [
    `${row.rank}. ${row.clientName}`,
    `Faturamento: <b>${formatMoney(row.totalAmount)}</b> (${formatPercent(row.share)})`,
    mutedLine(`Acumulado até aqui: ${formatPercent(row.cumulativeShare)}`),
    mutedLine(`${ABC_CLASS_LABEL[row.abcClass]} · ${row.orderCount} pedido(s)`),
  ];
};

export const ABC_EXPORT_HEADERS = [
  "Posição",
  "Cliente",
  "Classe",
  "Faturamento",
  "% do período",
  "% acumulado",
  "Pedidos",
  "Comissão",
  "Último faturamento",
];

export const buildAbcExportRows = (rows: AbcRow[]): (string | number)[][] =>
  rows.map((row) => [
    row.rank,
    row.clientName,
    row.abcClass,
    Number(row.totalAmount || 0),
    formatPercent(row.share),
    formatPercent(row.cumulativeShare),
    row.orderCount,
    Number(row.commissionAmount || 0),
    row.lastOrderDate ? formatDateDMY(row.lastOrderDate) : "—",
  ]);
