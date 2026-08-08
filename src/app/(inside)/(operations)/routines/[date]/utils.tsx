import { clientDisplayName } from "@/utils/client";
import {
  getCurrentWeekMondayIso,
  toUtcIsoDate as toIsoDate,
} from "@/utils/format/date";
import { VisitClient, VisitFactory } from "./interface";
import { factoryName } from "@/utils/company";
import {
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
  VisitStatusColor,
} from "@/utils/visit";

// Cor e rótulo de status são os MESMOS da grade semanal — a rota do dia só os
// chamava por outro nome, e manter duas tabelas iguais garantia que um status
// novo aparecesse traduzido numa tela e cru na outra.
export type StopStatusColor = VisitStatusColor;
export const STOP_STATUS_COLOR = VISIT_STATUS_COLOR;
export const STOP_STATUS_LABEL = VISIT_STATUS_LABEL;

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
  const km = Number(rawKm);
  if (!isFinite(km)) return `${rawKm} km`;
  return `${km.toFixed(1).replace(".", ",")} km`;
};

export const clientLabel = (client: VisitClient | null): string =>
  clientDisplayName(client);

export const factoryLabel = (factory: VisitFactory | null): string => {
  if (!factory) return "—";
  return factoryName(factory);
};

// Endereço em formato amigável ao Google Maps (vírgulas), ou null se não houver
// dados suficientes para localizar — usado para origem/destino/waypoints da rota.
export const mapsQuery = (client: VisitClient | null): string | null => {
  if (!client) return null;
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
        ? `${client.addressCity} - ${client.addressState}`
        : client.addressCity
    );
  } else if (client.addressState) {
    parts.push(client.addressState);
  }
  return parts.length > 0 ? parts.join(", ") : null;
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
