export type InsightKind =
  | "CLIENT_OVERDUE"
  | "PRIORITY_OFF_ROUTE"
  | "VISIT_OVERDUE"
  | "NO_VISIT_30D"
  | "DRAFT_STALE"
  | "PENDING_INVOICE"
  | "DELIVERY_UNCONFIRMED"
  | "INSTALLMENT_OVERDUE"
  | "GOAL_BEHIND";

export type InsightGroup = "WALLET" | "ORDERS" | "MONEY" | "GOALS";

/**
 * Por que o sistema já explica este caso.
 *
 * Só `PRIORITY_OFF_ROUTE` preenche hoje: os quatro primeiros são exclusões
 * DELIBERADAS do motor de rotina, e o cliente não foi esquecido — foi
 * descartado por uma regra. `NO_ROOM` é a ausência sem explicação, a única que
 * depende de uma decisão de quem lê.
 */
export type InsightCaseReason =
  | "ORDER_OPEN"
  | "VISIT_PENDING"
  | "DEFERRED"
  | "NO_GEOCODE"
  | "NO_ROOM";

export interface InsightSample {
  id: string;
  label: string;
  detail: string | null;
  link: string | null;
  reason: InsightCaseReason | null;
}

export interface Insight {
  kind: InsightKind;
  group: InsightGroup;
  /** Quantos casos dependem de uma decisão de quem lê — NÃO é o total. */
  count: number;
  /** Casos que existem mas cuja ausência o sistema já justifica. */
  blockedCount: number;
  /** Dinheiro envolvido — string decimal do backend, nulo quando não faz sentido. */
  amount: string | null;
  /** Dias úteis restantes no mês (só GOAL_BEHIND). */
  daysLeft: number | null;
  samples: InsightSample[];
}

export interface MyInsightsResponse {
  myInsights: {
    status: boolean;
    message: string;
    data: {
      generatedAt: string;
      insights: Insight[];
    } | null;
  } | null;
}

export interface InsightCasesResponse {
  myInsightCases: {
    status: boolean;
    message: string;
    data: {
      kind: InsightKind;
      totalCount: number;
      cases: InsightSample[];
    } | null;
  } | null;
}

export interface InsightsSellersResponse {
  insights_sellers: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
    totalCount: number;
  };
}

export interface InsightsContentProps {
  /** Gestor (owner/admin): escolhe de quem são as pendências. */
  canSelectSeller: boolean;
  /** Leitura já feita no servidor; null se o SSR falhou. */
  seed: MyInsightsResponse | null;
}
