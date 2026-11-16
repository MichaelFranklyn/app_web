import { toUtcIsoDate } from "@/utils/format/date";

import {
  AgendaView,
  CrossOfficeStop,
  VisitClient,
  VisitSchedule,
  VisitScheduleDay,
} from "./interface";

/**
 * As contas de calendário da Agenda (dia, semana, mês), sem React.
 *
 * Tudo em UTC sobre a data ISO, como o resto da tela: somar dias em horário
 * local erra na virada do horário de verão. A semana começa na SEGUNDA — é a
 * semana da rotina (`visit_schedules.week_start`).
 */

const MONTHS = [
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

const MONTHS_SHORT = MONTHS.map((m) => m.slice(0, 3));

const WEEKDAYS = [
  "domingo",
  "segunda-feira",
  "terça-feira",
  "quarta-feira",
  "quinta-feira",
  "sexta-feira",
  "sábado",
];

/** "Seg", "Ter"… — o cabeçalho das colunas (caixa mista: lê melhor que CAIXA ALTA). */
export const WEEKDAY_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const parse = (iso: string): Date => {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
};

export const addDays = (iso: string, days: number): string => {
  const date = parse(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toUtcIsoDate(date);
};

/** A segunda-feira da semana da data. */
export const mondayOf = (iso: string): string => {
  const weekday = parse(iso).getUTCDay();
  return addDays(iso, weekday === 0 ? -6 : 1 - weekday);
};

/** Os 7 dias (segunda → domingo) da semana que começa em `monday`. */
export const weekDates = (monday: string): string[] =>
  Array.from({ length: 7 }, (_, i) => addDays(monday, i));

/**
 * As semanas inteiras que cobrem o mês da âncora: da segunda da semana do dia
 * 1º ao domingo da semana do último dia — 4 a 6 linhas, como na folhinha.
 */
export const monthGrid = (anchor: string): string[][] => {
  const first = parse(anchor);
  first.setUTCDate(1);
  const last = new Date(first);
  last.setUTCMonth(last.getUTCMonth() + 1, 0);
  const weeks: string[][] = [];
  let monday = mondayOf(toUtcIsoDate(first));
  const lastIso = toUtcIsoDate(last);
  while (monday <= lastIso) {
    weeks.push(weekDates(monday));
    monday = addDays(monday, 7);
  }
  return weeks;
};

/** As semanas da rotina que a visão precisa buscar. */
export const weekStartsFor = (view: AgendaView, anchor: string): string[] =>
  view === "month"
    ? monthGrid(anchor).map((week) => week[0])
    : [mondayOf(anchor)];

/** Anda um passo na visão: um dia, uma semana ou um mês. */
export const shiftAnchor = (
  view: AgendaView,
  anchor: string,
  direction: 1 | -1
): string => {
  if (view === "day") return addDays(anchor, direction);
  if (view === "week") return addDays(anchor, 7 * direction);
  const date = parse(anchor);
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + direction);
  return toUtcIsoDate(date);
};

/** O mesmo mês da âncora? (as datas de fora ficam esmaecidas no mês) */
export const isSameMonth = (iso: string, anchor: string): boolean =>
  iso.slice(0, 7) === anchor.slice(0, 7);

export const dayNumber = (iso: string): number => parse(iso).getUTCDate();

/**
 * "Sábado, 18/10/2026". O dia da semana por extenso (é o que a pessoa procura
 * no celular) e a data em número: "18 de outubro de 2026" quebrava a barra em
 * duas linhas no celular (pedido do usuário, 13/11/2026).
 */
export const longDayLabel = (iso: string): string => {
  const date = parse(iso);
  const weekday = WEEKDAYS[date.getUTCDay()];
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${weekday[0].toUpperCase()}${weekday.slice(1)}, ${dd}/${mm}/${date.getUTCFullYear()}`;
};

/**
 * O título da barra, como na folhinha: o dia por extenso, o intervalo da
 * semana ("13 – 19 de outubro de 2026"; "29 set – 5 out de 2026" quando
 * atravessa o mês) ou o mês ("outubro de 2026").
 */
export const agendaTitle = (view: AgendaView, anchor: string): string => {
  if (view === "day") return longDayLabel(anchor);
  if (view === "month") {
    const date = parse(anchor);
    return `${MONTHS[date.getUTCMonth()]} de ${date.getUTCFullYear()}`;
  }
  const start = parse(mondayOf(anchor));
  const end = parse(addDays(mondayOf(anchor), 6));
  const year = end.getUTCFullYear();
  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${start.getUTCDate()} – ${end.getUTCDate()} de ${MONTHS[end.getUTCMonth()]} de ${year}`;
  }
  const startYear =
    start.getUTCFullYear() === year ? "" : ` de ${start.getUTCFullYear()}`;
  return `${start.getUTCDate()} ${MONTHS_SHORT[start.getUTCMonth()]}${startYear} – ${end.getUTCDate()} ${MONTHS_SHORT[end.getUTCMonth()]} de ${year}`;
};

/**
 * O cliente da parada. Vem do vínculo na agenda do vendedor e direto da parada
 * na do escritório (que não tem vínculo) — quem lê não precisa saber qual.
 */
export const itemClient = (item: {
  client?: VisitClient | null;
  clientFactoryLink?: { client: VisitClient | null } | null;
}): VisitClient | null => item.client ?? item.clientFactoryLink?.client ?? null;

/** Um dia da agenda, com a semana (rotina) de onde ele veio. */
export interface AgendaDay {
  date: string;
  /** A semana da rotina que contém o dia — nula quando ainda não existe. */
  scheduleId: string | null;
  /** O dia persistido; nulo quando nada foi marcado nele ainda. */
  day: VisitScheduleDay | null;
  /**
   * As paradas da pessoa nos OUTROS escritórios neste dia que pedem cartão
   * próprio — a visita ao cliente que também tem visita aqui não entra: ela
   * vira o selo `alsoInOffice` do cartão daqui (é uma ida só).
   */
  otherOffices: CrossOfficeStop[];
  /** Cliente (id global) → escritório onde ele também tem visita no dia. */
  alsoInOffice: Map<string, string>;
}

const isDriving = (contactType: string) => contactType !== "REMOTE";

/**
 * Separa as paradas do outro escritório de um dia: as que se juntam a uma
 * visita presencial daqui ao mesmo cliente (viram selo) e as que pedem cartão.
 * Só visita junta com visita: a ligação não tem ida a economizar.
 */
export const splitOtherOffices = (
  items: VisitScheduleDay["items"],
  stops: CrossOfficeStop[]
): Pick<AgendaDay, "otherOffices" | "alsoInOffice"> => {
  const visitedHere = new Set(
    items
      .filter((item) => isDriving(item.contactType))
      .map((item) => itemClient(item)?.id)
      .filter((id): id is string => Boolean(id))
  );
  const otherOffices: CrossOfficeStop[] = [];
  const alsoInOffice = new Map<string, string>();
  for (const stop of stops) {
    if (isDriving(stop.contactType) && visitedHere.has(stop.clientId)) {
      alsoInOffice.set(stop.clientId, stop.officeName);
    } else {
      otherOffices.push(stop);
    }
  }
  return {
    otherOffices: [...otherOffices].sort(
      (a, b) => a.plannedOrder - b.plannedOrder
    ),
    alsoInOffice,
  };
};

/**
 * O escritório onde o cliente desta visita presencial também tem visita no
 * dia — o selo "Também no …" do cartão. Nulo para ligação ou sem par.
 */
export const alsoInOfficeOf = (
  item: VisitScheduleDay["items"][number],
  alsoInOffice: Map<string, string> | undefined
): string | null => {
  if (!alsoInOffice || !isDriving(item.contactType)) return null;
  const clientId = itemClient(item)?.id;
  return (clientId && alsoInOffice.get(clientId)) || null;
};

/**
 * Junta as semanas buscadas num índice por data. O mês pede até seis semanas
 * de uma vez; o dia e a semana, uma — a tela lê todos pelo mesmo índice.
 */
export const indexDays = (
  schedules: VisitSchedule[],
  dates: string[],
  otherOfficeStops: CrossOfficeStop[] = []
): Map<string, AgendaDay> => {
  const stopsByDate = new Map<string, CrossOfficeStop[]>();
  for (const stop of otherOfficeStops) {
    const date = stop.date.slice(0, 10);
    stopsByDate.set(date, [...(stopsByDate.get(date) ?? []), stop]);
  }
  const byDate = new Map<
    string,
    { scheduleId: string; day: VisitScheduleDay }
  >();
  const scheduleByWeek = new Map<string, string>();
  for (const schedule of schedules) {
    scheduleByWeek.set(schedule.weekStart.slice(0, 10), schedule.id);
    for (const day of schedule.days) {
      byDate.set(day.date.slice(0, 10), { scheduleId: schedule.id, day });
    }
  }
  return new Map(
    dates.map((date) => {
      const found = byDate.get(date);
      return [
        date,
        {
          date,
          scheduleId:
            found?.scheduleId ?? scheduleByWeek.get(mondayOf(date)) ?? null,
          day: found?.day ?? null,
          ...splitOtherOffices(
            found?.day?.items ?? [],
            stopsByDate.get(date) ?? []
          ),
        },
      ];
    })
  );
};

/**
 * A semana em tela está em branco E ainda dá para montá-la: nenhum compromisso
 * em dia nenhum, ao menos um dia de hoje em diante, e esse dia não é folga.
 * Semana passada vazia é só histórico — oferecer "Montar semana" nela seria
 * um convite para planejar o que já passou.
 */
export const isPlannableBlankWeek = (
  dates: string[],
  days: Map<string, AgendaDay>,
  todayIso: string,
  dayOffDates: Set<string>
): boolean =>
  dates.every((date) => (days.get(date)?.day?.items.length ?? 0) === 0) &&
  dates.some((date) => date >= todayIso && !dayOffDates.has(date));
