import { toUtcIsoDate } from "@/utils/format/date";
import { DateRangeIso } from "../interface";

const MONTHS_SHORT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/** Período default dos gráficos: início do mês 11 meses atrás → hoje (12 meses). */
export const getLast12MonthsRangeIso = (): DateRangeIso => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  return {
    from: toUtcIsoDate(
      new Date(Date.UTC(start.getFullYear(), start.getMonth(), 1))
    ),
    to: toUtcIsoDate(
      new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    ),
  };
};

/** "2026-07" → "jul/26" para o eixo. */
export const monthKeyToLabel = (key: string): string => {
  const [year, month] = key.split("-");
  const idx = Number(month) - 1;
  if (idx < 0 || idx > 11) return key;
  return `${MONTHS_SHORT[idx]}/${year.slice(2)}`;
};

/** Dias arredondados, em linguagem concreta: "1 dia" / "18 dias". */
export const formatDays = (value: number): string => {
  const rounded = Math.round(value);
  return rounded === 1 ? "1 dia" : `${rounded} dias`;
};
