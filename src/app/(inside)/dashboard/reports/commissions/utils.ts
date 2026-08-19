import {
  COMMISSION_STATUS_LABEL,
  groupByFactory,
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
  CommissionRow,
  CommissionsByFactory,
  CommissionsTotals,
} from "./interface";

/**
 * Recorta as parcelas pelo período do relatório, pela data em que a comissão CAI
 * (`receiveDate`) — a mesma régua da tela de Comissões.
 *
 * Não é a data do pedido nem a do faturamento: a comissão de um pedido faturado em
 * junho com prazo de 30 dias cai em julho, e é em julho que ela entra no bolso.
 * Parcela sem data ainda não tem quando cair (depende do faturamento) e fica fora
 * de qualquer período — aparece na tela de Comissões como "previsto".
 */
export const filterByPeriod = (
  rows: CommissionRow[],
  from: string,
  to: string
): CommissionRow[] =>
  rows.filter(
    (row) =>
      !!row.receiveDate && row.receiveDate >= from && row.receiveDate <= to
  );

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
    }
    if (row.isOverdue || row.defaultedAt) totals.countOverdue += 1;
  }

  return totals;
};

/**
 * Agrupa por fábrica trabalhada — é assim que a fábrica manda a planilha, então
 * conferir fica direto. Reusa o `groupByFactory` da tela de Comissões para o
 * agrupamento e o nome da fábrica serem os mesmos nos dois lugares.
 */
export const byFactory = (rows: CommissionRow[]): CommissionsByFactory[] =>
  groupByFactory(rows)
    .map((group) => {
      const totals = summarize(group.rows);
      return {
        factoryId: group.factoryId,
        name: group.name,
        receivable: totals.receivable,
        received: totals.received,
        pending: totals.pending,
        count: group.rows.length,
      };
    })
    .sort(
      (a, b) =>
        b.receivable +
        b.received +
        b.pending -
        (a.receivable + a.received + a.pending)
    );

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
 * Colunas por onde as parcelas de comissão podem ser ordenadas.
 *
 * A ordem natural é a da conferência (data em que a comissão cai, ver
 * `sortForReport`); as outras respondem as perguntas do fechamento — "a maior
 * comissão do mês", "o que está previsto e ainda não caiu".
 */
export const COMMISSIONS_SORT_COLUMNS = {
  receiveDate: (row: CommissionRow) => row.receiveDate,
  client: (row: CommissionRow) => clientName(row.client),
  factory: (row: CommissionRow) => factoryName(row.factory),
  seller: (row: CommissionRow) => row.seller?.name,
  // Sem nota vai para o fim em ordem crescente: a leitura abre pelo que já dá
  // para conferir contra a planilha da fábrica.
  invoiceNumber: (row: CommissionRow) => row.invoiceNumber ?? "zzzz",
  installmentAmount: (row: CommissionRow) => Number(row.installmentAmount || 0),
  amount: (row: CommissionRow) => Number(row.amount || 0),
  status: (row: CommissionRow) => COMMISSION_STATUS_LABEL[row.status],
  isReconciled: (row: CommissionRow) => (row.isReconciled ? 1 : 0),
};

/** Como cada coluna ordenável se chama no papel, e em que sentido ela é lida. */
export const COMMISSIONS_SORT_LABELS: Record<string, SortLabel> = {
  receiveDate: { label: "Recebimento", kind: "date" },
  client: { label: "Cliente", kind: "text" },
  factory: { label: "Fábrica", kind: "text" },
  seller: { label: "Vendedor", kind: "text" },
  invoiceNumber: { label: "Nota fiscal", kind: "text" },
  installmentAmount: { label: "Valor da parcela", kind: "number" },
  amount: { label: "Comissão", kind: "number" },
  status: { label: "Situação", kind: "text" },
  isReconciled: { label: "Conferida", kind: "number" },
};

export const COMMISSIONS_EXPORT_HEADERS = [
  "Recebimento",
  "Cliente",
  "Fábrica",
  "Vendedor",
  "Nota fiscal",
  "Parcela",
  "Valor da parcela",
  "Comissão",
  "Situação",
  "Conferida",
];

export const buildCommissionsExportRows = (
  rows: CommissionRow[]
): (string | number)[][] =>
  rows.map((row) => [
    row.receiveDate ? formatDateDMY(row.receiveDate) : "—",
    clientName(row.client),
    factoryName(row.factory),
    row.seller?.name ?? "—",
    row.invoiceNumber ?? "—",
    String(row.sequence),
    Number(row.installmentAmount),
    Number(row.amount),
    COMMISSION_STATUS_LABEL[row.status],
    row.isReconciled ? "Sim" : "Não",
  ]);

/**
 * Ordena para a conferência: pela data em que a comissão cai e, no empate, por
 * cliente — a mesma leitura da planilha da fábrica. Sem data vai para o fim.
 */
export const sortForReport = (rows: CommissionRow[]): CommissionRow[] =>
  [...rows].sort(
    (a, b) =>
      (a.receiveDate ?? "9999-12-31").localeCompare(
        b.receiveDate ?? "9999-12-31"
      ) || clientName(a.client).localeCompare(clientName(b.client), "pt-BR")
  );
