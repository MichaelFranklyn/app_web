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

export const toIsoDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

export const getCurrentWeekMondayIso = (): string => {
  const now = new Date();
  const utc = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  );
  const dayOfWeek = utc.getUTCDay();
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  utc.setUTCDate(utc.getUTCDate() + offsetToMonday);
  return toIsoDate(utc);
};

export const getCurrentWeekRangeIso = (): { from: string; to: string } => {
  const from = getCurrentWeekMondayIso();
  const start = isoToDate(from);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { from, to: toIsoDate(end) };
};

const MONTH_LABELS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

export const formatDateRangeLabel = (fromIso: string, toIso: string): string => {
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
