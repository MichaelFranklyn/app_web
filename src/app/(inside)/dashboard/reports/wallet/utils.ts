import {
  SERIES_BLUE,
  SERIES_GREEN,
  SERIES_ORANGE,
  SERIES_RED,
} from "@/components/Chart/chartTheme";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../chartBuilders";
import { formatDays } from "../../utils";
import {
  WalletReport,
  WalletRow,
  WalletScope,
  WalletSituation,
} from "./interface";

/**
 * Rótulo da situação, em linguagem de quem atende a carteira — "sumiu" diz
 * mais do que "inativo" para quem vai ligar para o cliente.
 */
export const WALLET_SITUATION_LABEL: Record<WalletSituation, string> = {
  ACTIVE: "Em dia",
  AT_RISK: "Atrasado",
  INACTIVE: "Parado",
  NEW: "Novo",
  NEVER: "Nunca comprou",
};

/** O que cada situação significa, para o tooltip e o cabeçalho da coluna. */
export const WALLET_SITUATION_HINT: Record<WalletSituation, string> = {
  ACTIVE: "comprou dentro do próprio ritmo",
  AT_RISK: "passou do intervalo que costuma levar",
  INACTIVE: "passou do dobro do próprio intervalo",
  NEW: "primeira compra, há menos de 90 dias",
  NEVER: "está na carteira e nunca comprou",
};

export const WALLET_SITUATION_COLOR: Record<
  WalletSituation,
  "green" | "red" | "blue" | "neutral" | "subtle"
> = {
  ACTIVE: "green",
  AT_RISK: "red",
  INACTIVE: "neutral",
  NEW: "blue",
  NEVER: "subtle",
};

/** As visões da aba, da carteira inteira para o caso mais urgente. */
export const WALLET_SCOPES: { value: WalletScope; label: string }[] = [
  { value: "all", label: "Toda a carteira" },
  { value: "AT_RISK", label: "Atrasados" },
  { value: "INACTIVE", label: "Parados" },
  { value: "ACTIVE", label: "Em dia" },
  { value: "NEW", label: "Novos" },
  { value: "NEVER", label: "Nunca compraram" },
];

export const filterByScope = (
  rows: WalletRow[],
  scope: WalletScope
): WalletRow[] =>
  scope === "all" ? rows : rows.filter((row) => row.situation === scope);

export const sumBy = (
  rows: WalletRow[],
  pick: (row: WalletRow) => string | number
): number => rows.reduce((total, row) => total + Number(pick(row) || 0), 0);

export const cityAndState = (row: WalletRow): string =>
  [row.city, row.state].filter(Boolean).join(" / ") || "—";

/** "18 dias" / "nunca comprou" — o texto da coluna de tempo parado. */
export const idleLabel = (row: WalletRow): string =>
  row.daysSinceLastOrder === null
    ? "nunca comprou"
    : formatDays(row.daysSinceLastOrder);

/**
 * O ritmo do cliente escrito por extenso. Sem segundo pedido não há intervalo
 * próprio, e inventar um ("30 dias") faria a coluna mentir.
 */
export const cadenceLabel = (row: WalletRow): string =>
  row.avgIntervalDays ? `a cada ${formatDays(row.avgIntervalDays)}` : "—";

/** "1,8× o próprio ritmo" — o quanto o cliente passou do que costuma levar. */
export const riskLabel = (row: WalletRow): string =>
  row.riskRatio === null ? "—" : `${row.riskRatio.toFixed(1)}×`;

/**
 * Como a carteira se reparte entre as situações.
 *
 * Barra deitada, uma linha por situação: são cinco categorias com nome, e o que
 * se lê é o tamanho relativo dos grupos — quanto da carteira está de pé e
 * quanto já saiu do radar.
 */
export const buildSituationOption = (
  report: WalletReport
): EChartsCoreOption => {
  const entries: { situation: WalletSituation; count: number }[] = [
    { situation: "ACTIVE", count: report.activeClients },
    { situation: "AT_RISK", count: report.atRiskClients },
    { situation: "INACTIVE", count: report.inactiveClients },
    { situation: "NEW", count: report.newClients },
    { situation: "NEVER", count: report.neverBoughtClients },
  ];

  const colorBySituation: Record<WalletSituation, string> = {
    ACTIVE: SERIES_GREEN,
    AT_RISK: SERIES_RED,
    INACTIVE: SERIES_ORANGE,
    NEW: SERIES_BLUE,
    NEVER: "#9a9a8e",
  };

  return buildHorizontalBarOption(
    entries.map((entry) => WALLET_SITUATION_LABEL[entry.situation]),
    [
      {
        name: "Clientes",
        color: SERIES_GREEN,
        data: entries.map((entry) => entry.count),
        itemColors: entries.map((entry) => colorBySituation[entry.situation]),
      },
    ],
    (value) => String(Math.round(value)),
    (index) => {
      const entry = entries[index];
      if (!entry) return [];
      const share =
        report.totalClients > 0 ? entry.count / report.totalClients : 0;
      return [
        WALLET_SITUATION_LABEL[entry.situation],
        `<b>${entry.count}</b> de ${report.totalClients} cliente(s) · ${Math.round(share * 100)}%`,
        mutedLine(WALLET_SITUATION_HINT[entry.situation]),
      ];
    }
  );
};

export const WALLET_EXPORT_HEADERS = [
  "Cliente",
  "Cidade/UF",
  "Situação",
  "Última compra",
  "Dias parado",
  "Ritmo (dias)",
  "Atraso sobre o ritmo",
  "Pedidos (total)",
  "Pedidos no período",
  "Valor no período",
];

export const buildWalletExportRows = (
  rows: WalletRow[]
): (string | number)[][] =>
  rows.map((row) => [
    row.clientName,
    cityAndState(row),
    WALLET_SITUATION_LABEL[row.situation],
    row.lastOrderDate ? formatDateDMY(row.lastOrderDate) : "nunca comprou",
    row.daysSinceLastOrder ?? "—",
    row.avgIntervalDays ? Math.round(row.avgIntervalDays) : "—",
    riskLabel(row),
    row.orderCount,
    row.periodOrderCount,
    Number(row.periodAmount || 0),
  ]);

/** Fechamento do recorte exportado, para o PDF fechar com o que está impresso. */
export const summarize = (rows: WalletRow[]) => ({
  clients: rows.length,
  amount: formatMoney(sumBy(rows, (row) => row.periodAmount)),
  atRisk: rows.filter((row) => row.situation === "AT_RISK").length,
  inactive: rows.filter((row) => row.situation === "INACTIVE").length,
});
