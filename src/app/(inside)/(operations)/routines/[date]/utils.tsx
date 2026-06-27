import {
  getCurrentWeekMondayIso,
  toUtcIsoDate as toIsoDate,
} from "@/utils/format/date";
import { VisitClient, VisitFactory, VisitStatus } from "./interface";

export type StopStatusColor = "green" | "amber" | "neutral" | "red" | "blue";

export const STOP_STATUS_COLOR: Record<VisitStatus, StopStatusColor> = {
  COMPLETED: "green",
  PENDING: "neutral",
  CLIENT_ABSENT: "red",
  CANCELLED: "red",
  RESCHEDULED: "blue",
  NO_TIME: "blue",
};

export const STOP_STATUS_LABEL: Record<VisitStatus, string> = {
  COMPLETED: "Realizada",
  PENDING: "Pendente",
  CLIENT_ABSENT: "Cliente ausente",
  CANCELLED: "Cancelada",
  RESCHEDULED: "Remarcada",
  NO_TIME: "Sem tempo",
};

export const getTodayIso = (): string => {
  const now = new Date();
  return toIsoDate(
    new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
  );
};

// Desloca uma data ISO em N dias (para navegar dia anterior/seguinte).
export const shiftDateIso = (isoDate: string, days: number): string => {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const utc = new Date(Date.UTC(year, month - 1, day));
  utc.setUTCDate(utc.getUTCDate() + days);
  return toIsoDate(utc);
};

// Segunda-feira da semana que contém `isoDate` (para abrir a rota de um dia
// específico vindo da rotina semanal).
export const getWeekMondayIso = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return getCurrentWeekMondayIso();
  const utc = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = utc.getUTCDay();
  const offsetToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  utc.setUTCDate(utc.getUTCDate() + offsetToMonday);
  return toIsoDate(utc);
};

const WEEKDAY_LABELS = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export const formatDateLong = (isoDate: string): string => {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  const date = new Date(Date.UTC(year, month - 1, day));
  const weekday = WEEKDAY_LABELS[date.getUTCDay()];
  const dd = String(day).padStart(2, "0");
  const mm = String(month).padStart(2, "0");
  return `${dd}/${mm}/${year} · ${weekday}`;
};

export const formatMinutes = (mins: number): string => {
  if (mins < 60) return `${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainder = mins % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
};

export const formatDistanceKm = (rawKm: string): string => {
  const value = Number(rawKm);
  if (!isFinite(value)) return `${rawKm} km`;
  return `${value.toFixed(1).replace(".", ",")} km`;
};

export const clientLabel = (client: VisitClient | null): string => {
  if (!client) return "Cliente —";
  return client.nomeFantasia ?? client.razaoSocial;
};

export const factoryLabel = (factory: VisitFactory | null): string => {
  if (!factory) return "—";
  return factory.nomeFantasia ?? factory.razaoSocial;
};

export const clientAddress = (client: VisitClient | null): string => {
  if (!client) return "Endereço não cadastrado";
  const parts: string[] = [];
  if (client.addressStreet) {
    parts.push(
      client.addressNumber
        ? `${client.addressStreet}, ${client.addressNumber}`
        : client.addressStreet
    );
  }
  if (client.addressNeighborhood) parts.push(client.addressNeighborhood);
  if (client.addressCity) {
    parts.push(
      client.addressState
        ? `${client.addressCity}/${client.addressState}`
        : client.addressCity
    );
  }
  return parts.length > 0 ? parts.join(" — ") : "Endereço não cadastrado";
};
