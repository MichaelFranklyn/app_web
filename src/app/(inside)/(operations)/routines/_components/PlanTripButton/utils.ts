import { toIsoDate } from "@/utils/format/date";

import { TripPeriod, TripPlan, TripRegionOption } from "./interface";

/** "Feira de Santana - BA · 12 clientes" — o que o select mostra. */
export const regionOptionLabel = (option: TripRegionOption): string => {
  const clients =
    option.clientCount === 1 ? "1 cliente" : `${option.clientCount} clientes`;
  return `${option.city} - ${option.state} · ${clients}`;
};

/** O input da mutation, ou null enquanto falta escolher algo. */
export const buildPlanInput = (
  sellerId: string | null,
  selectedKeys: string[],
  options: TripRegionOption[],
  period: TripPeriod,
  note: string,
  dryRun: boolean
) => {
  const cities = options
    .filter((option) => selectedKeys.includes(option.key))
    .map(({ city, state }) => ({ city, state }));
  const startDate = toIsoDate(period.from);
  const endDate = toIsoDate(period.to ?? period.from);
  if (!cities.length || !startDate || !endDate) return null;
  return {
    sellerId,
    cities,
    startDate,
    endDate,
    note: note.trim() || null,
    dryRun,
  };
};

/** Quantas visitas o plano põe na rotina. */
export const plannedVisitCount = (plan: TripPlan): number =>
  plan.days.reduce((total, day) => total + day.visits.length, 0);

/** Clientes da região que NÃO entram, somando todos os motivos. */
export const leftOutCount = (plan: TripPlan): number =>
  plan.leftOut.length +
  plan.ungeocoded.length +
  plan.alreadyScheduled.length +
  plan.unavailableCount;

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** "Seg, 05/10" a partir de "2026-10-05" — sem fuso no meio do caminho. */
export const tripDayLabel = (iso: string): string => {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  return `${weekday}, ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}`;
};
