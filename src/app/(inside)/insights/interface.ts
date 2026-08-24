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

export interface InsightSample {
  id: string;
  label: string;
  detail: string | null;
  link: string | null;
}

export interface Insight {
  kind: InsightKind;
  group: InsightGroup;
  /** Quantos casos existem no recorte. */
  count: number;
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
