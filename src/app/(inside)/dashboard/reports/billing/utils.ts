import {
  SERIES_GREEN,
  SERIES_ORANGE,
  SERIES_RED,
} from "@/components/Chart/chartTheme";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../chartBuilders";
import { SortLabel } from "@/utils/pdf/context";

import { BillingRow, BillingSituation } from "./interface";

/** Rótulo da situação da parcela, do jeito que a cobrança fala. */
export const BILLING_SITUATION_LABEL: Record<BillingSituation, string> = {
  DUE: "A vencer",
  OVERDUE: "Vencida",
  PAID: "Paga",
};

/**
 * Cor da situação: vencida é o que exige ação (vermelho), paga é o que já
 * fechou (verde) e a vencer é só o futuro (âmbar não — âmbar é interação).
 */
export const BILLING_SITUATION_COLOR: Record<
  BillingSituation,
  "blue" | "green" | "red"
> = {
  DUE: "blue",
  OVERDUE: "red",
  PAID: "green",
};

/** As três situações como opções do filtro, na ordem em que a cobrança pergunta. */
export const BILLING_SITUATION_OPTIONS = (
  ["OVERDUE", "DUE", "PAID"] as BillingSituation[]
).map((situation) => ({
  value: situation,
  label: BILLING_SITUATION_LABEL[situation],
}));

export const sumBy = (
  rows: BillingRow[],
  pick: (row: BillingRow) => string
): number => rows.reduce((total, row) => total + Number(pick(row) || 0), 0);

/** "3 dias" / "1 dia" — o atraso escrito por extenso. */
export const overdueLabel = (days: number): string => {
  if (days <= 0) return "—";
  return days === 1 ? "1 dia" : `${days} dias`;
};

/** Vencimento por extenso; "sem data" quando o prazo não gerou data. */
export const dueDateLabel = (dueDate: string | null): string =>
  dueDate ? formatDateDMY(dueDate) : "sem data";

/**
 * O que vence (e o que já venceu) em cada fábrica.
 *
 * Empilhado de propósito: as três situações são partes do mesmo total daquela
 * fábrica, e o que se lê de relance é o tamanho da barra inteira — quanto
 * daquela fábrica está em jogo no período — com a fatia vermelha mostrando o
 * quanto disso já está atrasado.
 */
export const buildFactoryOption = (rows: BillingRow[]): EChartsCoreOption => {
  const byFactory = new Map<
    string,
    { overdue: number; due: number; paid: number; total: number }
  >();

  for (const row of rows) {
    const entry = byFactory.get(row.factoryName) ?? {
      overdue: 0,
      due: 0,
      paid: 0,
      total: 0,
    };
    const amount = Number(row.amount || 0);
    if (row.situation === "OVERDUE") entry.overdue += amount;
    else if (row.situation === "PAID") entry.paid += amount;
    else entry.due += amount;
    entry.total += amount;
    byFactory.set(row.factoryName, entry);
  }

  const entries = [...byFactory.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 8);
  const labels = entries.map(([name]) => name);

  return buildHorizontalBarOption(
    labels,
    [
      {
        name: "Vencida",
        color: SERIES_RED,
        data: entries.map(([, value]) => value.overdue),
      },
      {
        name: "A vencer",
        color: SERIES_ORANGE,
        data: entries.map(([, value]) => value.due),
      },
      {
        name: "Paga",
        color: SERIES_GREEN,
        data: entries.map(([, value]) => value.paid),
      },
    ],
    (value) => formatMoney(value),
    (index) => {
      const entry = entries[index];
      if (!entry) return [];
      const [name, value] = entry;
      return [
        name,
        `Total: <b>${formatMoney(value.total)}</b>`,
        mutedLine(`Vencida: ${formatMoney(value.overdue)}`),
        mutedLine(`A vencer: ${formatMoney(value.due)}`),
        mutedLine(`Paga: ${formatMoney(value.paid)}`),
      ];
    },
    { stacked: true }
  );
};

/**
 * Colunas por onde as duplicatas podem ser ordenadas.
 *
 * O vencimento é a ordem natural (é a agenda de cobrança); as outras respondem
 * as perguntas do dia — "a maior vencida", "quem está mais atrasado".
 */
export const BILLING_SORT_COLUMNS = {
  dueDate: (row: BillingRow) => row.dueDate,
  situation: (row: BillingRow) => BILLING_SITUATION_LABEL[row.situation],
  daysOverdue: (row: BillingRow) => row.daysOverdue,
  client: (row: BillingRow) => row.clientName,
  factory: (row: BillingRow) => row.factoryName,
  amount: (row: BillingRow) => Number(row.amount || 0),
  commissionAmount: (row: BillingRow) => Number(row.commissionAmount || 0),
};

/** Como cada coluna ordenável se chama no papel, e em que sentido ela é lida. */
export const BILLING_SORT_LABELS: Record<string, SortLabel> = {
  dueDate: { label: "Vencimento", kind: "date" },
  situation: { label: "Situação", kind: "text" },
  daysOverdue: { label: "Atraso", kind: "number" },
  client: { label: "Cliente", kind: "text" },
  factory: { label: "Fábrica", kind: "text" },
  amount: { label: "Valor", kind: "number" },
  commissionAmount: { label: "Comissão", kind: "number" },
};

export const BILLING_EXPORT_HEADERS = [
  "Vencimento",
  "Situação",
  "Atraso (dias)",
  "Cliente",
  "Fábrica",
  "Vendedor",
  "Pedido faturado em",
  "Parcela",
  "Valor",
  "Comissão",
  "Pago em",
];

export const buildBillingExportRows = (
  rows: BillingRow[]
): (string | number)[][] =>
  rows.map((row) => [
    row.dueDate ? formatDateDMY(row.dueDate) : "sem data",
    BILLING_SITUATION_LABEL[row.situation],
    row.daysOverdue,
    row.clientName,
    row.factoryName,
    row.sellerName,
    row.invoicedAt ? formatDateDMY(row.invoicedAt) : "—",
    row.sequence,
    Number(row.amount || 0),
    Number(row.commissionAmount || 0),
    row.paidAt ? formatDateDMY(row.paidAt) : "—",
  ]);
