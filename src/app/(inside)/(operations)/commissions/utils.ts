import { clientName } from "@/utils/company";
import {
  isInMonth,
  yearMonthFromIso,
  type YearMonth,
} from "@/utils/format/month";
import { CommissionRow } from "./interface";

// O vocabulário da situação e o agrupamento por fábrica subiram para
// `(inside)/_shared/commissions` quando o relatório de comissões passou a
// precisar deles — o papel e a tela têm de chamar a mesma coisa pelo mesmo nome.
// Re-exportados aqui porque a página inteira já os consome por este arquivo.
import { groupByFactory } from "../../_shared/commissions";

export {
  COMMISSION_STATUS_LABEL,
  COMMISSION_STATUS_TONE,
  groupByFactory,
} from "../../_shared/commissions";

/** O grupo desta página é sempre de linhas de comissão — o genérico fica no pai. */
export type FactoryGroup =
  import("../../_shared/commissions").FactoryGroup<CommissionRow>;

export type CommissionTab =
  | "receivable"
  | "pending"
  | "received"
  | "overdue"
  | "all";

export const COMMISSION_TABS: { id: CommissionTab; label: string }[] = [
  { id: "receivable", label: "A receber" },
  { id: "pending", label: "Previsto" },
  { id: "received", label: "Recebido" },
  { id: "overdue", label: "Boleto em atraso" },
  { id: "all", label: "Todas" },
];

/**
 * Recorta as linhas pela situação escolhida.
 *
 * "Boleto em atraso" não é um status de comissão e sim do BOLETO: junta o
 * vencido não pago com o calote confirmado, que é o que está travando o
 * dinheiro. As demais abas continuam filtrando pelo status da comissão.
 */
export const filterByTab = (
  rows: CommissionRow[],
  tab: CommissionTab
): CommissionRow[] => {
  if (tab === "all") return rows;
  if (tab === "overdue")
    return rows.filter((row) => row.isOverdue || row.defaultedAt !== null);
  return rows.filter((row) => row.status === tab);
};

/**
 * Recorta pelo mês escolhido. A data que importa muda com a aba: nas de
 * comissão é quando o dinheiro cai (`receiveDate`); em "Boleto em atraso" é o
 * VENCIMENTO — o atraso se conta pelo boleto, e um calote pode nem ter data de
 * recebimento ainda (fica na fila do escritório).
 */
export const filterByMonth = (
  rows: CommissionRow[],
  month: YearMonth,
  tab: CommissionTab
): CommissionRow[] =>
  rows.filter((row) =>
    isInMonth(tab === "overdue" ? row.dueDate : row.receiveDate, month)
  );

// A navegação por mês virou coisa de duas telas (comissões e metas) e mora em
// @/utils/format/month. Re-exportado aqui porque a página inteira já a consome
// por este arquivo — o importante é existir uma implementação só.
export {
  addMonths,
  isInMonth,
  monthLabel,
  yearMonthFromIso,
  type YearMonth,
} from "@/utils/format/month";

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
  receivable: number; // a receber no mês, JÁ LÍQUIDO dos estornos
  received: number; // já recebido no mês
  pending: number; // previsto no mês (depende de faturamento/pagamento)
  countReceivable: number; // parcelas a receber no mês
  chargeback: number; // estornos (negativo) que caem no mês
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
    chargeback: 0,
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
    } else if (row.status === "chargeback") {
      // Estorno já vem negativo: entra no a receber para o mês fechar líquido.
      summary.chargeback += Number(row.amount);
      summary.receivable += Number(row.amount);
    }
  }
  return summary;
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
  receivable: number; // soma a receber, JÁ LÍQUIDA dos estornos
  received: number; // soma recebida
  pending: number; // soma prevista (depende de faturamento/pagamento)
  chargeback: number; // soma dos estornos (negativa)
  reconciledCount: number; // quantas parcelas já foram conferidas
  receivableIds: string[]; // parcelas a receber (para "Receber tudo")
  overdueCount: number; // boletos vencidos ou em calote
}

/**
 * Subtotais de um conjunto de linhas (já recortado por fábrica e pelos filtros):
 * o que há a receber, o que já veio, quantas foram conferidas e os ids a receber
 * para o repasse em massa.
 */
export const summarizeRows = (rows: CommissionRow[]): RowsSummary => {
  const summary: RowsSummary = {
    receivable: 0,
    received: 0,
    pending: 0,
    chargeback: 0,
    reconciledCount: 0,
    receivableIds: [],
    overdueCount: 0,
  };
  for (const row of rows) {
    if (row.status === "receivable") {
      summary.receivable += Number(row.amount);
      summary.receivableIds.push(row.installmentId);
    }
    if (row.status === "received") summary.received += Number(row.amount);
    if (row.status === "pending") summary.pending += Number(row.amount);
    if (row.status === "chargeback") {
      summary.chargeback += Number(row.amount);
      summary.receivable += Number(row.amount);
    }
    if (row.isReconciled) summary.reconciledCount += 1;
    if (row.isOverdue || row.defaultedAt) summary.overdueCount += 1;
  }
  return summary;
};

export interface FactoryHighlight {
  label: string;
  value: number;
  color?: "amber" | "green" | "red";
}

/**
 * Os valores que o cabeçalho do cartão da fábrica destaca, conforme a situação
 * escolhida nos filtros. Com "A receber" ligado, um "Recebido R$ 0,00" ao lado
 * era só ruído — o cartão mostra o número que o filtro pediu.
 */
export const factoryHighlights = (
  summary: RowsSummary,
  tab: CommissionTab
): FactoryHighlight[] => {
  switch (tab) {
    case "receivable":
      return [
        { label: "A receber", value: summary.receivable, color: "amber" },
      ];
    case "received":
      return [{ label: "Recebido", value: summary.received, color: "green" }];
    case "pending":
      return [{ label: "Previsto", value: summary.pending }];
    case "overdue":
      return [{ label: "Estorno", value: summary.chargeback, color: "red" }];
    default:
      return [
        { label: "A receber", value: summary.receivable, color: "amber" },
        { label: "Recebido", value: summary.received, color: "green" },
      ];
  }
};
