import {
  COMMISSION_STATUS_LABEL,
  type CommissionLens,
  type CommissionStatus,
} from "@/app/(inside)/_shared/commissions";
import {
  SERIES_BLUE,
  SERIES_GREEN,
  SERIES_ORANGE,
} from "@/components/Chart/chartTheme";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { SortLabel } from "@/utils/pdf/context";
import type { EChartsCoreOption } from "echarts/core";

import { buildHorizontalBarOption, mutedLine } from "../../chartBuilders";
import {
  CommissionReportFactoryRaw,
  CommissionReportTotalsRaw,
  CommissionRow,
  CommissionsByFactory,
  CommissionsSplit,
  CommissionsTotals,
} from "./interface";

/** As situações que somam no relatório — as outras não são dinheiro de ninguém. */
const COUNTED_STATUSES: CommissionStatus[] = [
  "receivable",
  "received",
  "pending",
  "chargeback",
  "refund",
];

/**
 * Fecha o conjunto de parcelas nas situações que importam.
 *
 * O estorno (calote depois de a comissão ter sido paga) já vem negativo e é
 * somado ao "a receber": o relatório precisa mostrar o LÍQUIDO, senão promete
 * um valor que a fábrica vai descontar no mesmo fechamento.
 */
export const summarize = (rows: CommissionRow[]): CommissionsTotals => {
  const totals: CommissionsTotals = {
    receivable: 0,
    received: 0,
    pending: 0,
    count: rows.length,
    countReceivable: 0,
    chargeback: 0,
    countOverdue: 0,
  };

  for (const row of rows) {
    const amount = Number(row.amount);
    if (row.status === "receivable") {
      totals.receivable += amount;
      totals.countReceivable += 1;
    } else if (row.status === "received") {
      totals.received += amount;
    } else if (row.status === "pending") {
      totals.pending += amount;
    } else if (row.status === "chargeback") {
      totals.chargeback += amount;
      totals.receivable += amount;
    } else if (row.status === "refund") {
      // Devolução é positiva: o cliente pagou depois de o desconto ter saído, e
      // o valor volta pelo mesmo fechamento. Fora daqui, ela sumia do total.
      totals.receivable += amount;
    }
    if (row.isOverdue || row.defaultedAt) totals.countOverdue += 1;
  }

  return totals;
};

/**
 * Quanto da comissão do período fica com a EMPRESA.
 *
 * A comissão tem dois donos em sequência: a fábrica paga o escritório, e o
 * vendedor tem a taxa dele sobre o pedido — combinada por vendedor E por
 * fábrica, então não é uma porcentagem que se aplique de cabeça sobre o total.
 * Sem esta conta o relatório mostra só o número de cima, e o repasse parece não
 * existir.
 *
 * As duas pontas saem das MESMAS parcelas, e não cada uma pelo seu calendário:
 * o vendedor pode ser pago num mês diferente, e comparar dois conjuntos daria
 * uma sobra que não é de ninguém. Vale só para quem enxerga o nível do
 * escritório (gestor); na visão do vendedor `amount` já É a comissão dele.
 *
 * Estorno entra naturalmente: ele é negativo nos dois níveis, e o líquido cai
 * dos dois lados.
 */
export const splitTotals = (rows: CommissionRow[]): CommissionsSplit => {
  // As mesmas situações que o `summarize` conta: cancelada nunca gerou comissão
  // e estorno já descontado virou histórico. Somá-las aqui faria a repartição
  // não fechar com o total do período logo ao lado.
  const scope = rows.filter((row) => COUNTED_STATUSES.includes(row.status));
  const company = scope.reduce((sum, row) => sum + Number(row.amount), 0);
  const seller = scope.reduce((sum, row) => sum + Number(row.sellerAmount), 0);

  return {
    company,
    seller,
    office: company - seller,
    // Período sem comissão nenhuma não tem margem: 0 é melhor do que uma
    // divisão por zero virando "Infinity%" na tela.
    margin: company !== 0 ? (company - seller) / company : 0,
  };
};

const num = (value: string | number | null | undefined) => Number(value ?? 0);

/**
 * Os totais que o servidor somou, no formato que a tela já desenhava.
 *
 * A soma é a MESMA de `summarize` + `splitTotals` (o servidor espelha as duas,
 * ver `commission_report.py`); só deixou de ser feita aqui porque a tela não
 * tem mais todas as linhas — tem uma página.
 */
export const totalsFromServer = (
  raw: CommissionReportTotalsRaw | undefined
): { totals: CommissionsTotals; split: CommissionsSplit } => ({
  totals: {
    receivable: num(raw?.receivable),
    received: num(raw?.received),
    pending: num(raw?.pending),
    count: raw?.count ?? 0,
    countReceivable: raw?.countReceivable ?? 0,
    chargeback: num(raw?.chargeback),
    countOverdue: raw?.countOverdue ?? 0,
  },
  split: {
    company: num(raw?.company),
    seller: num(raw?.seller),
    office: num(raw?.office),
    margin: raw?.margin ?? 0,
  },
});

/** Comissão por fábrica do período — já agrupada e ordenada pelo servidor. */
export const factoriesFromServer = (
  raw: CommissionReportFactoryRaw[] | undefined
): CommissionsByFactory[] =>
  (raw ?? []).map((group) => ({
    factoryId: group.factoryId,
    name: group.name,
    receivable: num(group.receivable),
    received: num(group.received),
    pending: num(group.pending),
    count: group.count,
    split: {
      company: num(group.company),
      seller: num(group.seller),
      office: num(group.office),
      margin: group.margin,
    },
  }));

/**
 * Comissão por fábrica, empilhada nas três situações.
 *
 * Empilhado porque as partes somam a comissão do período naquela fábrica — a
 * barra inteira é o total, e as cores dizem em que pé está: verde já entrou,
 * âmbar é o que se pode cobrar agora, azul ainda depende do faturamento.
 */
export const buildFactoryOption = (
  groups: CommissionsByFactory[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    groups.map((group) => group.name),
    [
      {
        name: "Recebido",
        color: SERIES_GREEN,
        data: groups.map((group) => group.received),
      },
      {
        name: "A receber",
        color: SERIES_ORANGE,
        data: groups.map((group) => group.receivable),
      },
      {
        name: "Previsto",
        color: SERIES_BLUE,
        data: groups.map((group) => group.pending),
      },
    ],
    (value) => formatMoney(value),
    (index) => {
      const group = groups[index];
      if (!group) return [];
      return [
        group.name,
        `Recebido: <b>${formatMoney(group.received)}</b>`,
        `A receber: <b>${formatMoney(group.receivable)}</b>`,
        `Previsto: <b>${formatMoney(group.pending)}</b>`,
        mutedLine(`${group.count} parcela(s)`),
      ];
    },
    { stacked: true }
  );

/**
 * A repartição da comissão por fábrica: o que fica no escritório e o que vai
 * para o vendedor.
 *
 * Empilhado porque as duas partes SOMAM a comissão daquela fábrica — a barra
 * inteira é o que a fábrica paga, e a divisão mostra de onde vem (ou não vem) a
 * margem. É o gráfico que responde "qual fábrica me dá dinheiro depois do
 * repasse", que a comissão bruta sozinha esconde.
 */
export const buildSplitOption = (
  groups: CommissionsByFactory[]
): EChartsCoreOption =>
  buildHorizontalBarOption(
    groups.map((group) => group.name),
    [
      {
        name: "Fica no escritório",
        color: SERIES_GREEN,
        data: groups.map((group) => group.split.office),
      },
      {
        name: "Repasse ao vendedor",
        color: SERIES_ORANGE,
        data: groups.map((group) => group.split.seller),
      },
    ],
    (value) => formatMoney(value),
    (index) => {
      const group = groups[index];
      if (!group) return [];
      return [
        group.name,
        `Comissão da fábrica: <b>${formatMoney(group.split.company)}</b>`,
        `Fica no escritório: <b>${formatMoney(group.split.office)}</b>`,
        `Repasse ao vendedor: <b>${formatMoney(group.split.seller)}</b>`,
        mutedLine(`${Math.round(group.split.margin * 100)}% de margem`),
      ];
    },
    { stacked: true }
  );

/** Como cada coluna ordenável se chama no papel, e em que sentido ela é lida. */
export const COMMISSIONS_SORT_LABELS: Record<string, SortLabel> = {
  receiveDate: { label: "Recebimento", kind: "date" },
  client: { label: "Cliente", kind: "text" },
  factory: { label: "Fábrica", kind: "text" },
  seller: { label: "Vendedor", kind: "text" },
  invoiceNumber: { label: "Nota fiscal", kind: "text" },
  installmentAmount: { label: "Valor da parcela", kind: "number" },
  amount: { label: "Comissão", kind: "number" },
  sellerAmount: { label: "Repasse ao vendedor", kind: "number" },
  officeAmount: { label: "Fica no escritório", kind: "number" },
  status: { label: "Situação", kind: "text" },
  isReconciled: { label: "Conferida", kind: "number" },
};

/**
 * Cabeçalhos da planilha.
 *
 * A ótica do escritório acrescenta a repartição entre a empresa e o vendedor.
 * No extrato do vendedor ela não sai: `Comissão` ali JÁ é a fatia dele, e as
 * duas colunas extras seriam o dinheiro da empresa numa folha que é dele.
 */
export const commissionsExportHeaders = (lens: CommissionLens): string[] => {
  const withOffice = lens.audience === "office";
  return [
    "Recebimento",
    "Cliente",
    "Fábrica",
    "Vendedor",
    "Nota fiscal",
    "Parcela",
    "Valor da parcela",
    withOffice ? "Comissão da empresa" : "Comissão",
    ...(withOffice ? ["Repasse ao vendedor", "Fica no escritório"] : []),
    "Situação",
    "Conferida",
  ];
};

export const buildCommissionsExportRows = (
  rows: CommissionRow[],
  lens: CommissionLens
): (string | number)[][] =>
  rows.map((row) => [
    lens.receiveDate(row)
      ? formatDateDMY(lens.receiveDate(row) as string)
      : "—",
    clientName(row.client),
    factoryName(row.factory),
    row.seller?.name ?? "—",
    row.invoiceNumber ?? "—",
    String(row.sequence),
    Number(row.installmentAmount),
    lens.amount(row),
    ...(lens.audience === "office"
      ? [
          Number(row.sellerAmount),
          Number(row.amount) - Number(row.sellerAmount),
        ]
      : []),
    COMMISSION_STATUS_LABEL[lens.status(row)],
    row.isReconciled ? "Sim" : "Não",
  ]);

/**
 * Colunas ordenáveis — quem ordena é o servidor (`sortBy` do
 * `CommissionReportInput`); a ordem padrão é a da conferência: data em que a
 * comissão cai e, no empate, cliente.
 */
export const COMMISSIONS_SORT_KEYS = Object.keys(COMMISSIONS_SORT_LABELS);
