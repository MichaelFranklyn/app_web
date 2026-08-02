import {
  getCurrentWeekMondayIso,
  getTodayIso,
  toUtcIsoDate as toIsoDate,
} from "@/utils/format/date";
import { factoryName } from "@/utils/company";
import { explainScore, ScoreExplanation } from "@/utils/score";
import { VisitScheduleDay, VisitScheduleItem, VisitStatus } from "./interface";

export { VISIT_STATUS_COLOR, VISIT_STATUS_LABEL } from "@/utils/visit";
export { getTodayIso };

export interface VisitFollowupWarning {
  needsStock: boolean;
  needsOrder: boolean;
  message: string;
}

// Uma visita CONCLUÍDA precisa render alguma informação útil para a próxima
// rotina: ou o estoque observado no cliente, ou o resultado/pedido. Basta UMA
// das duas (o vendedor pode só ter levantado o estoque, sem fechar pedido).
// Só avisamos quando NENHUMA foi registrada.
//
// "Registrou estoque" = tratou ao menos uma fábrica. As fábricas tratadas saem
// das observações de estoque por produto, então a lista vazia é exatamente o
// caso de quem saiu da loja sem levantar nada.
export const getVisitFollowupWarning = (
  item: VisitScheduleItem
): VisitFollowupWarning | null => {
  if (item.status !== "COMPLETED") return null;
  const needsStock = (item.treatedFactories ?? []).length === 0;
  const needsOrder = item.outcome == null;
  if (!needsStock || !needsOrder) return null;
  return {
    needsStock,
    needsOrder,
    message: "Visita concluída — registre o estoque ou lance o pedido.",
  };
};

/**
 * Score da visita: o MAIOR entre as fábricas em foco, não o do vínculo principal.
 *
 * A visita é ao cliente e carrega N fábricas; mostrar o score de uma delas
 * escolhida por acaso esconde justamente a urgente. Cai no vínculo só nas visitas
 * antigas, geradas antes de o foco existir.
 */
export const getVisitScoreTotal = (item: VisitScheduleItem): number | null => {
  // `Number(null)` é 0, não NaN: sem descartar o nulo antes, uma fábrica em foco
  // que nunca teve score entraria como zero e ainda venceria o `Math.max` de uma
  // lista toda nula.
  const focusScores = (item.focusFactories ?? [])
    .map((focus) => toScore(focus.scoreTotal))
    .filter((score): score is number => score !== null);

  if (focusScores.length > 0) return Math.max(...focusScores);

  return toScore(item.clientFactoryLink?.latestVisitScore?.scoreTotal ?? null);
};

/** Motivo do score de UMA empresa (fábrica) que puxou esta visita. */
export interface VisitScoreReason {
  /** Chave estável para a lista (id do vínculo ou da fábrica). */
  key: string;
  factoryLabel: string;
  explanation: ScoreExplanation;
}

/**
 * Por que esta visita existe, empresa por empresa.
 *
 * A visita é ao CLIENTE, mas quem pontua é o vínculo com cada fábrica — o
 * vendedor precisa saber que vai lá porque a Telhas Potiguar está com estoque
 * no fim, não só que "o score é 78". As dimensões vêm do score ATUAL do vínculo
 * (`latestVisitScore`), não do total congelado na geração da rotina.
 *
 * Ordena da empresa mais urgente para a menos urgente e ignora vínculos sem
 * score calculado (nada a explicar). Visitas antigas, geradas antes de o foco
 * existir, caem no vínculo principal.
 */
export const getVisitScoreReasons = (
  item: VisitScheduleItem
): VisitScoreReason[] => {
  const fromFocus = (item.focusFactories ?? []).flatMap((focus, index) => {
    const dims = focus.clientFactoryLink?.latestVisitScore;
    if (!dims) return [];
    return [
      {
        key:
          focus.clientFactoryLink?.id ?? focus.factory?.id ?? `focus-${index}`,
        factoryLabel: factoryName(focus.factory),
        explanation: explainScore(dims),
      },
    ];
  });

  const link = item.clientFactoryLink;
  const reasons =
    fromFocus.length > 0
      ? fromFocus
      : link?.latestVisitScore
        ? [
            {
              key: link.id,
              factoryLabel: factoryName(link.factory),
              explanation: explainScore(link.latestVisitScore),
            },
          ]
        : [];

  return [...reasons].sort((a, b) => b.explanation.total - a.explanation.total);
};

const toScore = (raw: string | null): number | null => {
  if (raw == null) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
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

// Só é possível gerar uma rotina inexistente para a semana atual ou a próxima.
// Semanas mais distantes (ou passadas) não exibem o botão de gerar.
export const canGenerateWeek = (weekStartIso: string): boolean => {
  const current = getCurrentWeekMondayIso();
  const next = shiftWeekIso(current, 1);
  return weekStartIso === current || weekStartIso === next;
};

/**
 * O dia já passou — não há rota a gerar para ele.
 *
 * O backend recusa gerar rota para trás (a visita seria impossível e ainda
 * "gastaria" o cliente, que só entra uma vez na semana). Aqui o botão some antes
 * de o vendedor tentar, para o erro nunca aparecer.
 */
export const isPastDay = (dateIso: string, todayIso: string): boolean =>
  dateIso < todayIso;

export const getIsoWeekNumber = (isoDate: string): number => {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return 0;
  const date = new Date(Date.UTC(year, month - 1, day));
  const dayOfWeek = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayOfWeek + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const diffDays = Math.round(
    (date.getTime() - firstThursday.getTime()) / 86400000
  );
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

// Ordena as visitas de um dia pela sequência planejada da rota (plannedOrder),
// que é a ordem em que o vendedor deve percorrê-las. Não muta o array recebido.
export const sortVisitsByRoute = (
  items: VisitScheduleItem[]
): VisitScheduleItem[] =>
  [...items].sort((a, b) => a.plannedOrder - b.plannedOrder);

// Janela do período: começa em hoje (se a semana exibida o contém) ou na
// segunda-feira; cobre `periodDays` dias. `periodDays >= 7` mostra a semana
// toda. Compartilhado pela grade (kanban) e pela lista para que os dois modos
// exibam exatamente o mesmo recorte de dias.
export const getVisibleCells = (
  cells: WeekDayCell[],
  periodDays: number,
  todayIso: string
): WeekDayCell[] => {
  if (periodDays >= 7) return cells;
  const todayIndex = cells.findIndex((c) => c.date === todayIso);
  const anchor = todayIndex >= 0 ? todayIndex : 0;
  return cells.slice(anchor, anchor + periodDays);
};

// Opções dos enums — value = NOME do membro GraphQL, label = PT.
export { VISIT_STATUS_OPTIONS, VISIT_OUTCOME_OPTIONS } from "@/utils/visit";

export const RESCHEDULE_REASON_OPTIONS = [
  { value: "CLIENT_ABSENT", label: "Cliente ausente" },
  { value: "NO_TIME", label: "Sem tempo" },
  { value: "RESCHEDULED", label: "Reagendado" },
  { value: "CANCELLED", label: "Cancelado" },
];

/**
 * O compromisso no relógio: "09:40 · 30 min".
 *
 * Existe porque o card mostrava só `estimatedTravelMin` ("· 7m") — o tempo de
 * DESLOCAMENTO até a parada, que todo mundo lia como "visita de 7 minutos". A
 * visita tem duração própria (a configuração do vendedor, 30 min por padrão) e
 * hora marcada; o deslocamento é outra informação, e aparece com nome.
 *
 * Contato remoto não tem horário previsto (não é parada de rota): sobra só a
 * posição na fila do dia.
 */
export const formatVisitSlot = (item: {
  plannedStartTime: string | null;
  visitDurationMin: number | null;
}): string => {
  if (!item.plannedStartTime) return "";
  const duration = item.visitDurationMin
    ? ` · ${item.visitDurationMin} min`
    : "";
  return ` · ${item.plannedStartTime}${duration}`;
};

/** "20 min até aqui" — o deslocamento, dito com todas as letras. */
export const formatTravelToStop = (
  estimatedTravelMin: number | null
): string | null =>
  estimatedTravelMin == null || estimatedTravelMin <= 0
    ? null
    : `${estimatedTravelMin} min até aqui`;
