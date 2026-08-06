import {
  SERIES_GREEN,
  SERIES_ORANGE,
  SERIES_RED,
} from "@/components/Chart/chartTheme";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../chartBuilders";
import { BillingRow, BillingScope, BillingSituation } from "./interface";

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

/** As quatro visões da aba, na ordem em que a cobrança pergunta. */
export const BILLING_SCOPES: { value: BillingScope; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "overdue", label: "Vencidas" },
  { value: "due", label: "A vencer" },
  { value: "paid", label: "Pagas" },
];

const SCOPE_SITUATION: Record<
  Exclude<BillingScope, "all">,
  BillingSituation
> = {
  due: "DUE",
  overdue: "OVERDUE",
  paid: "PAID",
};

/** Aplica o recorte local da aba sobre as linhas do período. */
export const filterByScope = (
  rows: BillingRow[],
  scope: BillingScope
): BillingRow[] =>
  scope === "all"
    ? rows
    : rows.filter((row) => row.situation === SCOPE_SITUATION[scope]);

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
