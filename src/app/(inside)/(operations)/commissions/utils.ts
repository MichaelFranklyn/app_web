import { clientName, factoryName } from "@/utils/company";
import { CommissionRow, CommissionStatus } from "./interface";

export const COMMISSION_STATUS_LABEL: Record<CommissionStatus, string> = {
  pending: "Previsto",
  receivable: "A receber",
  received: "Recebido",
  cancelled: "Cancelado",
};

export const COMMISSION_STATUS_TONE: Record<
  CommissionStatus,
  "neutral" | "amber" | "green" | "red"
> = {
  pending: "neutral",
  receivable: "amber",
  received: "green",
  cancelled: "red",
};

export type CommissionTab = "receivable" | "pending" | "received" | "all";

export const COMMISSION_TABS: { id: CommissionTab; label: string }[] = [
  { id: "receivable", label: "A receber" },
  { id: "pending", label: "Previsto" },
  { id: "received", label: "Recebido" },
  { id: "all", label: "Todas" },
];

const MONTHS_PT = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export interface YearMonth {
  year: number;
  month: number; // 1-12
}

/** Mês/ano de uma data ISO "YYYY-MM-DD" (ou "YYYY-MM"). */
export const yearMonthFromIso = (iso: string): YearMonth => {
  const [y, m] = iso.split("-");
  return { year: Number(y), month: Number(m) };
};

/** Soma `delta` meses (pode ser negativo), normalizando o ano. */
export const addMonths = (
  { year, month }: YearMonth,
  delta: number
): YearMonth => {
  const zeroBased = year * 12 + (month - 1) + delta;
  return { year: Math.floor(zeroBased / 12), month: (zeroBased % 12) + 1 };
};

/** Rótulo "julho de 2026". */
export const monthLabel = ({ year, month }: YearMonth): string =>
  `${MONTHS_PT[month - 1]} de ${year}`;

/** True se a data ISO cai no mês/ano informado. */
export const isInMonth = (
  iso: string | null | undefined,
  { year, month }: YearMonth
): boolean => {
  if (!iso) return false;
  const ym = yearMonthFromIso(iso);
  return ym.year === year && ym.month === month;
};

/**
 * Mês/ano mais recente entre as datas de recebimento (`receiveDate`) das linhas,
 * ou `null` se nenhuma tem data. Usado para abrir cada fábrica já no mês da
 * planilha mais nova — que é a que o gestor costuma conferir primeiro.
 */
export const latestMonthWithData = (
  rows: CommissionRow[]
): YearMonth | null => {
  let best: YearMonth | null = null;
  let bestKey = -Infinity;
  for (const row of rows) {
    if (!row.receiveDate) continue;
    const ym = yearMonthFromIso(row.receiveDate);
    const key = ym.year * 12 + ym.month;
    if (key > bestKey) {
      bestKey = key;
      best = ym;
    }
  }
  return best;
};

export interface MonthSummary {
  receivable: number; // a receber no mês
  received: number; // já recebido no mês
  pending: number; // previsto no mês (depende de faturamento/pagamento)
  countReceivable: number; // parcelas a receber no mês
}

/**
 * Consolida as comissões de UM mês (pela data em que a comissão cai,
 * `receiveDate`) somando todas as fábricas — é o "quanto o vendedor vai receber
 * em agosto". Linhas previstas sem data de recebimento entram como previsto.
 */
export const summarizeMonth = (
  rows: CommissionRow[],
  month: YearMonth
): MonthSummary => {
  const summary: MonthSummary = {
    receivable: 0,
    received: 0,
    pending: 0,
    countReceivable: 0,
  };
  for (const row of rows) {
    if (!isInMonth(row.receiveDate, month)) continue;
    if (row.status === "receivable") {
      summary.receivable += Number(row.amount);
      summary.countReceivable += 1;
    } else if (row.status === "received") {
      summary.received += Number(row.amount);
    } else if (row.status === "pending") {
      summary.pending += Number(row.amount);
    }
  }
  return summary;
};

// ── Agrupamento por fábrica (de-para com a planilha) ─────────────────────────
export interface FactoryGroup {
  factoryId: string;
  name: string;
  rows: CommissionRow[]; // todas as linhas da fábrica (todos os meses)
}

const FACTORYLESS_ID = "__sem_fabrica__";

/**
 * Agrupa as linhas por fábrica trabalhada — é assim que a fábrica manda a
 * planilha, então bater o olho fica direto. Cada grupo traz TODAS as linhas da
 * fábrica; quem recorta por mês (a planilha é mensal) é o card, com o seletor de
 * mês próprio. Ordena por nome da fábrica (pt-BR).
 */
export const groupByFactory = (rows: CommissionRow[]): FactoryGroup[] => {
  const byId = new Map<string, FactoryGroup>();

  for (const row of rows) {
    const id = row.factory?.id ?? FACTORYLESS_ID;
    let group = byId.get(id);
    if (!group) {
      group = { factoryId: id, name: factoryName(row.factory), rows: [] };
      byId.set(id, group);
    }
    group.rows.push(row);
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.name.localeCompare(b.name, "pt-BR")
  );
};

// ── Relatório do que a fábrica tem a pagar no mês (PDF) ──────────────────────
export interface ReceivableFactoryGroup {
  factoryId: string;
  name: string;
  /** Parcelas a receber da fábrica no mês, da mais próxima para a mais distante. */
  rows: CommissionRow[];
  subtotal: number;
}

export interface ReceivableReport {
  groups: ReceivableFactoryGroup[];
  total: number;
  count: number;
}

/**
 * Recorta apenas o que há A RECEBER no mês (pela data em que a comissão cai),
 * agrupado por fábrica e com subtotal de cada uma — é o documento que o gestor
 * leva para cobrar/conferir o repasse. Previsto e recebido ficam de fora de
 * propósito: o papel responde "quanto ainda tenho para receber neste mês".
 *
 * Dentro da fábrica, as parcelas saem por data de recebimento (as sem data por
 * último) e, no empate, por cliente — a mesma leitura da planilha da fábrica.
 */
export const receivableReport = (
  rows: CommissionRow[],
  month: YearMonth
): ReceivableReport => {
  const receivable = rows.filter(
    (row) => row.status === "receivable" && isInMonth(row.receiveDate, month)
  );

  const groups = groupByFactory(receivable).map((group) => ({
    factoryId: group.factoryId,
    name: group.name,
    rows: [...group.rows].sort(
      (a, b) =>
        (a.receiveDate ?? "9999-12-31").localeCompare(
          b.receiveDate ?? "9999-12-31"
        ) || clientName(a.client).localeCompare(clientName(b.client), "pt-BR")
    ),
    subtotal: group.rows.reduce((sum, row) => sum + Number(row.amount), 0),
  }));

  return {
    groups,
    total: groups.reduce((sum, group) => sum + group.subtotal, 0),
    count: receivable.length,
  };
};

export interface RowsSummary {
  receivable: number; // soma a receber
  received: number; // soma recebida
  reconciledCount: number; // quantas parcelas já foram conferidas
  receivableIds: string[]; // parcelas a receber (para "Receber tudo")
}

/**
 * Subtotais de um conjunto de linhas (já recortado por fábrica e mês pelo card):
 * o que há a receber, o que já veio, quantas foram conferidas e os ids a receber
 * para o repasse em massa.
 */
export const summarizeRows = (rows: CommissionRow[]): RowsSummary => {
  const summary: RowsSummary = {
    receivable: 0,
    received: 0,
    reconciledCount: 0,
    receivableIds: [],
  };
  for (const row of rows) {
    if (row.status === "receivable") {
      summary.receivable += Number(row.amount);
      summary.receivableIds.push(row.installmentId);
    }
    if (row.status === "received") summary.received += Number(row.amount);
    if (row.isReconciled) summary.reconciledCount += 1;
  }
  return summary;
};
