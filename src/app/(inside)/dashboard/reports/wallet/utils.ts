import { SERIES_GREEN } from "@/components/Chart/chartTheme";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { SortLabel } from "@/utils/pdf/context";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../chartBuilders";
import { formatDays } from "../../utils";
import {
  ClientSituation,
  SITUATION_HINT,
  SITUATION_LABEL,
  SITUATION_ORDER,
  SITUATION_SERIES_COLOR,
} from "../situation";
import { WalletReport, WalletRow } from "./interface";

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
  const countBySituation: Record<ClientSituation, number> = {
    ACTIVE: report.activeClients,
    AT_RISK: report.atRiskClients,
    INACTIVE: report.inactiveClients,
    NEW: report.newClients,
    NEVER: report.neverBoughtClients,
  };
  const entries = SITUATION_ORDER.map((situation) => ({
    situation,
    count: countBySituation[situation],
  }));

  return buildHorizontalBarOption(
    entries.map((entry) => SITUATION_LABEL[entry.situation]),
    [
      {
        name: "Clientes",
        color: SERIES_GREEN,
        data: entries.map((entry) => entry.count),
        itemColors: entries.map(
          (entry) => SITUATION_SERIES_COLOR[entry.situation]
        ),
      },
    ],
    (value) => String(Math.round(value)),
    (index) => {
      const entry = entries[index];
      if (!entry) return [];
      const share =
        report.totalClients > 0 ? entry.count / report.totalClients : 0;
      return [
        SITUATION_LABEL[entry.situation],
        `<b>${entry.count}</b> de ${report.totalClients} cliente(s) · ${Math.round(share * 100)}%`,
        mutedLine(SITUATION_HINT[entry.situation]),
      ];
    }
  );
};

/**
 * Colunas por onde a carteira pode ser ordenada, e o que comparar em cada uma.
 *
 * A ordenação é em memória (o relatório vem inteiro) e é ela que responde às
 * perguntas de trabalho: "quem está parado há mais tempo" é a coluna do tempo
 * parado em ordem decrescente.
 */
export const WALLET_SORT_COLUMNS = {
  client: (row: WalletRow) => row.clientName,
  city: (row: WalletRow) => cityAndState(row),
  situation: (row: WalletRow) => SITUATION_LABEL[row.situation],
  idle: (row: WalletRow) => row.daysSinceLastOrder,
  cadence: (row: WalletRow) => row.avgIntervalDays,
  risk: (row: WalletRow) => row.riskRatio,
  lastOrderDate: (row: WalletRow) => row.lastOrderDate,
  periodAmount: (row: WalletRow) => Number(row.periodAmount || 0),
};

/** Como cada coluna ordenável se chama no papel, e em que sentido ela é lida. */
export const WALLET_SORT_LABELS: Record<string, SortLabel> = {
  client: { label: "Cliente", kind: "text" },
  city: { label: "Cidade/UF", kind: "text" },
  situation: { label: "Situação", kind: "text" },
  idle: { label: "Parado há", kind: "number" },
  cadence: { label: "Ritmo", kind: "number" },
  risk: { label: "Atraso sobre o ritmo", kind: "number" },
  lastOrderDate: { label: "Última compra", kind: "date" },
  periodAmount: { label: "No período", kind: "number" },
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
    SITUATION_LABEL[row.situation],
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
