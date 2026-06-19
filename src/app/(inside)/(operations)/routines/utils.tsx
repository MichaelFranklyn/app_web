import { VisitScheduleDay, VisitStatus } from "./interface";

export type StatusColor = "green" | "amber" | "neutral" | "red" | "blue";

export const VISIT_STATUS_COLOR: Record<VisitStatus, StatusColor> = {
  COMPLETED: "green",
  PENDING: "neutral",
  CLIENT_ABSENT: "red",
  CANCELLED: "red",
  RESCHEDULED: "blue",
  NO_TIME: "blue",
};

export const VISIT_STATUS_LABEL: Record<VisitStatus, string> = {
  COMPLETED: "Realizada",
  PENDING: "Pendente",
  CLIENT_ABSENT: "Cliente ausente",
  CANCELLED: "Cancelada",
  RESCHEDULED: "Remarcada",
  NO_TIME: "Sem tempo",
};

export const VISIT_URGENCY_BORDER: Record<VisitStatus, string> = {
  COMPLETED: "border-l-[3px] border-l-(--green)",
  PENDING: "border-l-[3px] border-l-(--blue)",
  CLIENT_ABSENT: "border-l-[3px] border-l-(--red)",
  CANCELLED: "border-l-[3px] border-l-(--red)",
  RESCHEDULED: "border-l-[3px] border-l-(--blue)",
  NO_TIME: "border-l-[3px] border-l-(--amber)",
};

const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

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

export const formatDayLabel = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return `${String(day).padStart(2, "0")} ${MONTH_LABELS[month - 1]}`;
};

export const formatWeekdayLabel = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return "";
  const date = new Date(Date.UTC(year, month - 1, day));
  return WEEKDAY_LABELS[date.getUTCDay()];
};

export const formatWeekRange = (weekStartIso: string): string => {
  const [year, month, day] = weekStartIso.split("-").map(Number);
  if (!year || !month || !day) return weekStartIso;
  const start = new Date(Date.UTC(year, month - 1, day));
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const startLabel = `${String(start.getUTCDate()).padStart(2, "0")} ${MONTH_LABELS[start.getUTCMonth()]}`;
  const endLabel = `${String(end.getUTCDate()).padStart(2, "0")} ${MONTH_LABELS[end.getUTCMonth()]}`;
  return `${startLabel} a ${endLabel} de ${end.getUTCFullYear()}`;
};

const toIsoDate = (date: Date): string => {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getTodayIso = (): string => {
  const now = new Date();
  return toIsoDate(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  );
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

// Segunda-feira (início da semana) da semana que contém a data informada.
// Usa os componentes locais da Date escolhida no calendário para não sofrer
// deslocamento de fuso ao normalizar em UTC.
export const getWeekMondayIsoFromDate = (date: Date): string => {
  const utc = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayOfWeek = utc.getUTCDay();
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  utc.setUTCDate(utc.getUTCDate() + offsetToMonday);
  return toIsoDate(utc);
};

// Date local a partir de um ISO (para popular o valor do Input.Date).
export const isoToLocalDate = (isoDate: string): Date | null => {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

export const shiftWeekIso = (isoDate: string, weeks: number): string => {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + weeks * 7);
  return toIsoDate(date);
};

export const getIsoWeekNumber = (isoDate: string): number => {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return 0;
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayOfWeek + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const diffDays = Math.round((date.getTime() - firstThursday.getTime()) / 86400000);
  return 1 + Math.floor(diffDays / 7);
};

export interface WeekDayCell {
  date: string;
  weekdayLabel: string;
  dayLabel: string;
  day: VisitScheduleDay | null;
}

// Monta os 7 dias (Seg→Dom) a partir do início da semana, mapeando os dias já
// persistidos no schedule; dias sem rotina (folga) vêm com `day: null`.
export const buildWeekDays = (
  weekStartIso: string,
  days: VisitScheduleDay[]
): WeekDayCell[] => {
  const byDate = new Map(days.map((d) => [d.date.slice(0, 10), d]));
  const [year, month, day] = weekStartIso.split("-").map(Number);
  if (!year || !month || !day) return [];
  const start = new Date(Date.UTC(year, month - 1, day));
  const cells: WeekDayCell[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const iso = toIsoDate(d);
    cells.push({
      date: iso,
      weekdayLabel: formatWeekdayLabel(iso),
      dayLabel: formatDayLabel(iso),
      day: byDate.get(iso) ?? null,
    });
  }
  return cells;
};

// Opções dos enums — value = NOME do membro GraphQL, label = PT.
export const VISIT_STATUS_OPTIONS = [
  { value: "PENDING", label: "Pendente" },
  { value: "COMPLETED", label: "Realizada" },
  { value: "CLIENT_ABSENT", label: "Cliente ausente" },
  { value: "NO_TIME", label: "Sem tempo" },
  { value: "RESCHEDULED", label: "Remarcada" },
  { value: "CANCELLED", label: "Cancelada" },
];

export const VISIT_OUTCOME_OPTIONS = [
  { value: "SOLD", label: "Vendeu" },
  { value: "NOT_BOUGHT", label: "Não comprou" },
  { value: "RESCHEDULED", label: "Reagendou" },
  { value: "CLOSED", label: "Fechado" },
];

export const STOCK_OBSERVATION_OPTIONS = [
  { value: "OUT_OF_STOCK", label: "Zerado" },
  { value: "LOW", label: "Baixo" },
  { value: "ADEQUATE", label: "Adequado" },
  { value: "HIGH", label: "Alto" },
];

export const RESCHEDULE_REASON_OPTIONS = [
  { value: "CLIENT_ABSENT", label: "Cliente ausente" },
  { value: "NO_TIME", label: "Sem tempo" },
  { value: "RESCHEDULED", label: "Reagendado" },
  { value: "CANCELLED", label: "Cancelado" },
];
