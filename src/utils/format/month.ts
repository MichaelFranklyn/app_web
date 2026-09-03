/**
 * Mês/ano como unidade de navegação.
 *
 * Comissões e metas trabalham do mesmo jeito: uma tela por mês, com setas para
 * andar no tempo. Os helpers nasceram em comissões e subiram para cá quando a
 * segunda tela precisou deles — duas cópias divergem no primeiro ajuste (o
 * rótulo em português, a virada de ano).
 */

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

/**
 * True quando `a` é um mês anterior a `b` — a ordem no calendário, não a
 * comparação campo a campo (dezembro de 2026 vem ANTES de janeiro de 2027).
 */
export const isBeforeMonth = (a: YearMonth, b: YearMonth): boolean =>
  a.year * 12 + a.month < b.year * 12 + b.month;

/** True se a data ISO cai no mês/ano informado. */
export const isInMonth = (
  iso: string | null | undefined,
  { year, month }: YearMonth
): boolean => {
  if (!iso) return false;
  const ym = yearMonthFromIso(iso);
  return ym.year === year && ym.month === month;
};

/** Primeiro dia do mês em ISO ("2026-08-01") — como as metas gravam o período. */
export const monthStartIso = ({ year, month }: YearMonth): string =>
  `${year}-${String(month).padStart(2, "0")}-01`;

/**
 * Último dia do mês em ISO ("2026-08-31").
 *
 * `new Date(ano, mês, 0)` devolve o último dia do mês anterior ao índice — com
 * `month` já 1-based, é exatamente o fim do mês pedido, com fevereiro e ano
 * bissexto resolvidos pelo próprio calendário.
 */
export const monthEndIso = ({ year, month }: YearMonth): string => {
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
};
