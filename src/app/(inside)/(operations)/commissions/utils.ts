import { CommissionStatus } from "./interface";

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
