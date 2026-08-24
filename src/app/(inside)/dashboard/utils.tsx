import {
  getBrtTodayIso,
  toUtcIsoDate,
  weekMondayIso,
} from "@/utils/format/date";
import { DateRangeIso, OrderStatus } from "./interface";

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

/**
 * A semana (segunda a domingo) que contém um dia ISO qualquer.
 *
 * Sem argumento, a semana de hoje EM BRASÍLIA — e não a do relógio do ambiente:
 * a página busca esta mesma semana no servidor para semear o cache, e um
 * servidor em UTC ancoraria outra semana das 21h em diante. Aí o dado do SSR
 * não casaria com a consulta do navegador e a tela voltaria a piscar o esqueleto.
 */
export const getCurrentWeekRangeIso = (
  todayIso: string = getBrtTodayIso()
): DateRangeIso => {
  const from = weekMondayIso(todayIso);
  const start = isoToDate(from);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  return { from, to: toUtcIsoDate(end) };
};

/** Quantos pedidos do período entram na soma do faturamento. */
export const ORDERS_PAGE_SIZE = 100;

/** Quantas linhas a tabela "Pedidos recentes" mostra. */
export const RECENT_ORDERS_SIZE = 4;

/** Vendedores no seletor do gestor. */
export const SELLERS_VARIABLES = { input: { first: 200 } };

// Anexa o filtro de vendedor às buscas do painel quando um gestor escolhe
// alguém no seletor. Vendedor logado é escopado pelo backend (token), não aqui.
const withSeller = (
  filters: { field: string; operator: string; value: string }[],
  sellerId: string | null
) =>
  sellerId
    ? [...filters, { field: "seller_id", operator: "eq", value: sellerId }]
    : filters;

/**
 * As variáveis das três consultas do painel.
 *
 * Uma função só, chamada pelo SERVIDOR (que busca para semear o cache) e pelo
 * hook do cliente (que consulta). O seed do Apollo casa por variável: bastava
 * um `first` diferente entre os dois lados para o cache dar miss e a tela pagar
 * de novo a ida à rede que o SSR tinha acabado de pagar.
 */
export const dashboardVariables = (
  range: DateRangeIso,
  sellerId: string | null
) => ({
  orders: {
    input: {
      first: ORDERS_PAGE_SIZE,
      filters: withSeller(
        [
          { field: "order_date", operator: "gte", value: range.from },
          { field: "order_date", operator: "lte", value: range.to },
        ],
        sellerId
      ),
      order: { by: "created_at", dir: "desc" },
    },
  },
  recentOrders: {
    input: {
      first: RECENT_ORDERS_SIZE,
      filters: withSeller(
        [
          { field: "order_date", operator: "gte", value: range.from },
          { field: "order_date", operator: "lte", value: range.to },
        ],
        sellerId
      ),
      order: { by: "created_at", dir: "desc" },
    },
  },
  clientsCount: {
    input: { first: 1, filters: withSeller([], sellerId) },
  },
  schedules: {
    input: {
      first: 20,
      filters: withSeller(
        [
          { field: "week_start", operator: "gte", value: range.from },
          { field: "week_start", operator: "lte", value: range.to },
        ],
        sellerId
      ),
    },
  },
});

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
