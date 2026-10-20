import type { BadgeColor } from "@/components/Badges/Root/interface";
import { factoryName } from "@/utils/company";
import { getCurrentWeekMondayIso } from "@/utils/format/date";
import { explainScore, ScoreReason } from "@/utils/score";
import { contactNoun } from "@/utils/visit";

import {
  formatDayLabel,
  formatWeekdayLabel,
  getNextWeekMondayIso,
  isWeekendToday,
  shiftDayIso,
} from "../utils";
import {
  PriorityClient,
  PriorityScheduledTouch,
  PriorityScope,
  PriorityTier,
  PriorityUnavailableReason,
  RegionGroup,
  WeekChoice,
  WeekSelection,
  WeekSetup,
} from "./interface";

/**
 * Faixa RELATIVA à carteira do vendedor (decisão de 18/10/2026). Os nomes não
 * repetem "Urgente" de propósito: aquele rótulo é da escala absoluta do score,
 * que punha 70% da carteira no vermelho.
 */
export const TIER_LABEL: Record<PriorityTier, string> = {
  TOP: "Prioridade máxima",
  HIGH: "Prioridade alta",
  NORMAL: "Pode esperar",
};

export const TIER_COLOR: Record<PriorityTier, BadgeColor> = {
  TOP: "red",
  HIGH: "orange",
  NORMAL: "neutral",
};

export const TIER_HINT: Record<PriorityTier, string> = {
  TOP: "Entre os clientes que mais precisam de você nesta carteira.",
  HIGH: "Na metade de cima da sua lista de clientes.",
  NORMAL: "Na metade de baixo da sua lista — dá para esperar ou ligar.",
};

export const UNAVAILABLE_LABEL: Record<PriorityUnavailableReason, string> = {
  OPEN_ORDER: "Pedido feito, esperando entrega",
  NEGATIVE: "Negativado nas fábricas",
  DEFERRED: "Pediu para não ser procurado agora",
};

/**
 * A semana que a tela abre: no sábado e no domingo já é a que vem — é quando o
 * vendedor monta a próxima.
 */
export const defaultPlanWeek = (): string =>
  isWeekendToday() ? getNextWeekMondayIso() : getCurrentWeekMondayIso();

/** "Seg 20 Out" — o rótulo de um dia nas escolhas e na prévia. */
export const dayChipLabel = (iso: string): string =>
  `${formatWeekdayLabel(iso).slice(0, 3)} ${formatDayLabel(iso)}`;

/** Onde o cliente já está nesta semana, numa frase curta. */
export const scheduledLabel = (
  touches: PriorityScheduledTouch[]
): string | null => {
  if (touches.length === 0) return null;
  return touches
    .map(
      (t) =>
        `${contactNoun(t.contactType)} ${dayChipLabel(t.date).toLowerCase()}`
    )
    .join(" · ");
};

/** O cliente aparece com o filtro atual? */
const isVisible = (
  client: PriorityClient,
  scope: PriorityScope,
  search: string,
  selection: WeekSelection
): boolean => {
  const term = normalize(search);
  if (term) {
    const text = normalize(
      `${client.name} ${client.neighborhood ?? ""} ${client.cityLabel}`
    );
    return text.includes(term);
  }
  // O que já foi escolhido nunca some da tela ao trocar o filtro.
  if (scope === "all" || selection[client.clientId]) return true;
  return client.tier !== "NORMAL" || client.isForced;
};

const normalize = (text: string): string =>
  text.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * Os clientes visíveis agrupados por cidade. A cidade com o cliente mais
 * urgente vem primeiro, e dentro dela a ordem é a da fila.
 */
export const groupByRegion = (
  clients: PriorityClient[],
  scope: PriorityScope,
  search: string,
  selection: WeekSelection
): RegionGroup[] => {
  const groups = new Map<string, RegionGroup>();
  for (const client of clients) {
    if (!isVisible(client, scope, search, selection)) continue;
    const group = groups.get(client.regionKey) ?? {
      key: client.regionKey,
      label: client.cityLabel,
      clients: [],
      topCount: 0,
    };
    group.clients.push(client);
    if (client.tier === "TOP") group.topCount += 1;
    groups.set(client.regionKey, group);
  }
  const ordered = [...groups.values()];
  ordered.forEach((g) => g.clients.sort((a, b) => a.rank - b.rank));
  return ordered.sort((a, b) => a.clients[0].rank - b.clients[0].rank);
};

/** "Todas" no filtro de cidade. */
export const ALL_CITIES = "all";

/**
 * As cidades que a lista mostra com o filtro de cidade. Cidade que sumiu (o
 * vendedor trocou para Prioritários e ela ficou vazia) volta para todas: a
 * tela nunca fica em branco por causa de um filtro esquecido.
 */
export const filterByCity = (
  groups: RegionGroup[],
  city: string
): { groups: RegionGroup[]; city: string } => {
  const match = groups.filter((g) => g.key === city);
  return match.length > 0
    ? { groups: match, city }
    : { groups, city: ALL_CITIES };
};

/** Os clientes escolhidos, na ordem da fila — o painel "Sua semana". */
export const chosenClients = (
  selection: WeekSelection,
  clients: PriorityClient[]
): PriorityClient[] =>
  clients.filter((c) => selection[c.clientId]).sort((a, b) => a.rank - b.rank);

const WEEKDAY_SHORT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

/** "Qua" — o dia da semana escolhido (ISO 1 = segunda). */
export const weekdayShort = (weekday: number): string =>
  WEEKDAY_SHORT[weekday - 1] ?? "";

/** Quantas visitas e quantas ligações estão escolhidas. */
export const selectionCounts = (selection: WeekSelection) => {
  const choices = Object.values(selection);
  const visits = choices.filter((c) => c.contactType === "IN_PERSON").length;
  return { visits, calls: choices.length - visits, total: choices.length };
};

/** "5 visitas e 2 ligações" — sem a parte zerada. */
export const selectionPhrase = (selection: WeekSelection): string => {
  const { visits, calls } = selectionCounts(selection);
  const parts = [];
  if (visits) parts.push(`${visits} ${visits === 1 ? "visita" : "visitas"}`);
  if (calls) parts.push(`${calls} ${calls === 1 ? "ligação" : "ligações"}`);
  return parts.join(" e ");
};

/** A data daquele dia da semana (ISO 1 = segunda) dentro da semana. */
export const dateOfWeekday = (weekStart: string, weekday: number): string =>
  shiftDayIso(weekStart, weekday - 1);

/** Os sete dias da semana que começa em `weekStart`. */
export const weekDates = (weekStart: string): string[] =>
  Array.from({ length: 7 }, (_, index) => shiftDayIso(weekStart, index));

/**
 * Os dias que a configuração oferece já marcados: segunda a sexta, menos os
 * que já passaram. Fim de semana fica disponível, desmarcado.
 */
export const defaultWorkDays = (
  weekStart: string,
  todayIso: string
): string[] =>
  weekDates(weekStart)
    .slice(0, 5)
    .filter((iso) => iso >= todayIso);

/** A segunda da semana escolhida no modal. */
export const weekStartFor = (
  choice: WeekChoice,
  otherWeekStart: string
): string =>
  choice === "current"
    ? getCurrentWeekMondayIso()
    : choice === "next"
      ? getNextWeekMondayIso()
      : otherWeekStart;

/**
 * O input da `planWeek`, na ordem da fila (é ela que decide quem abre o dia).
 *
 * O dia escolhido por cliente é um dia da SEMANA; aqui vira a data da semana
 * configurada. Dia que já passou volta para "o sistema escolhe" — não há como
 * visitar para trás, e recusar a semana inteira por isso seria pior.
 */
export const buildPlanWeekInput = (
  sellerId: string | null,
  setup: WeekSetup,
  selection: WeekSelection,
  clients: PriorityClient[],
  todayIso: string,
  dryRun: boolean
) => {
  const rank = new Map(clients.map((c) => [c.clientId, c.rank]));
  const stops = Object.entries(selection)
    .sort(([a], [b]) => (rank.get(a) ?? 1e9) - (rank.get(b) ?? 1e9))
    .map(([clientId, choice]) => {
      const date =
        choice.weekday == null
          ? null
          : dateOfWeekday(setup.weekStart, choice.weekday);
      return {
        clientId,
        contactType: choice.contactType,
        date: date && date >= todayIso ? date : null,
      };
    });
  return {
    ...(sellerId ? { sellerId } : {}),
    weekStart: setup.weekStart,
    stops,
    days: setup.days,
    visitsPerDay: setup.visitsPerDay,
    callsPerDay: setup.callsPerDay,
    fillWithSuggestions: setup.fillWithSuggestions,
    dryRun,
  };
};

/**
 * Por que o cliente está onde está na fila: o motivo que mais pesa, da fábrica
 * mais urgente. O vendedor decide melhor sabendo "o estoque da Telhas X está
 * acabando" do que vendo só a posição.
 */
export const mainReason = (
  client: PriorityClient
): { factory: string; reason: ScoreReason } | null => {
  const explained = client.focusLinks
    .filter((link) => link.latestVisitScore)
    .map((link) => ({
      factory: factoryName(link.factory),
      explanation: explainScore(link.latestVisitScore!),
    }))
    .sort((a, b) => b.explanation.total - a.explanation.total);
  const top = explained.find((e) => e.explanation.reasons.length > 0);
  return top
    ? { factory: top.factory, reason: top.explanation.reasons[0] }
    : null;
};

/**
 * "Del Atacadista, Guerreiro Ferro e mais 3" — quem foi escolhido, na ordem
 * da fila. O modal de organizar abre com isto: a pessoa confere que está
 * organizando a semana DOS clientes que ela marcou.
 */
export const chosenNames = (
  selection: WeekSelection,
  clients: PriorityClient[],
  shown = 2
): string => {
  const names = chosenClients(selection, clients).map((c) => c.name);
  if (names.length <= shown + 1) {
    return names.length > 1
      ? `${names.slice(0, -1).join(", ")} e ${names[names.length - 1]}`
      : (names[0] ?? "");
  }
  return `${names.slice(0, shown).join(", ")} e mais ${names.length - shown}`;
};
