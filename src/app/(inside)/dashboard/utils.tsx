import { getCurrentWeekMondayIso, toUtcIsoDate } from "@/utils/format/date";
import { OrderStatus } from "./interface";

export type OrderStatusColor = "neutral" | "blue" | "amber" | "green" | "red";

export const ORDER_STATUS_COLOR: Record<OrderStatus, OrderStatusColor> = {
  DRAFT: "neutral",
  SENT: "blue",
  CONFIRMED: "amber",
  DELIVERED: "green",
  CANCELLED: "red",
};

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  CONFIRMED: "Confirmado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export const isoToDate = (iso: string): Date => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
};

// Returns a local-midnight Date, suitable for libraries that read calendar
// fields via local getters (e.g., react-day-picker). isoToDate above returns
// UTC midnight, which renders as the previous day in timezones west of UTC.
export const isoToLocalDate = (iso: string): Date => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
};

export const getCurrentWeekRangeIso = (): { from: string; to: string } => {
  const from = getCurrentWeekMondayIso();
  const start = isoToDate(from);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { from, to: toUtcIsoDate(end) };
};

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export const formatDateRangeLabel = (
  fromIso: string,
  toIso: string
): string => {
  const from = isoToDate(fromIso);
  const to = isoToDate(toIso);
  const fromLabel = `${String(from.getUTCDate()).padStart(2, "0")} ${MONTH_LABELS[from.getUTCMonth()]}`;
  const toLabel = `${String(to.getUTCDate()).padStart(2, "0")} ${MONTH_LABELS[to.getUTCMonth()]}`;
  return `${fromLabel} a ${toLabel} de ${to.getUTCFullYear()}`;
};

export const namedEntityLabel = (
  entity: { nomeFantasia: string | null; razaoSocial: string } | null
): string => {
  if (!entity) return "—";
  return entity.nomeFantasia ?? entity.razaoSocial;
};

// ── Formatadores das telas de análise ────────────────────────────────────
//
// Moram aqui, no pai, porque `analytics/` e `reports/` os consomem — as duas
// rotas escrevem o mesmo mês no eixo e a mesma porcentagem no cartão, e duas
// implementações já produziriam "jul/26" numa tela e "07/2026" na outra.

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

/** Fração (0..1) → "47%". Sem casas decimais: o público lê a ordem de grandeza,
 * não a precisão. */
export const formatPercent = (value: number): string =>
  `${Math.round(value * 100)}%`;

/** Contagem com o substantivo no singular/plural certo: "1 cliente" / "8 clientes". */
export const formatCount = (
  value: number,
  singular: string,
  plural: string
): string => `${value} ${value === 1 ? singular : plural}`;
