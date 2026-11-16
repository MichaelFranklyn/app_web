/** As oportunidades comerciais — o que sobrou de /insights depois da faxina. */
export type OpportunityKind = "CLIENT_OVERDUE" | "PRIORITY_OFF_ROUTE";

/**
 * Por que o sistema já explica este caso.
 *
 * Só `PRIORITY_OFF_ROUTE` preenche: os cinco primeiros são exclusões
 * DELIBERADAS do motor de rotina, e o cliente não foi esquecido — foi
 * descartado por uma regra. `NO_ROOM` é a ausência sem explicação, a única que
 * depende de uma decisão de quem lê.
 */
export type OpportunityCaseReason =
  | "CLIENT_NEGATIVE"
  | "ORDER_OPEN"
  | "VISIT_PENDING"
  | "DEFERRED"
  | "NO_GEOCODE"
  | "NO_ROOM";

export interface OpportunityCase {
  id: string;
  label: string;
  detail: string | null;
  link: string | null;
  reason: OpportunityCaseReason | null;
  /** O cliente (id global) — para agendar o contato ou planejar a visita. */
  clientId: string | null;
  /** Ligação já marcada na agenda de qualquer pessoa, de hoje em diante (ISO). */
  nextCallDate: string | null;
  /** Visita já marcada na agenda, de hoje em diante (ISO). */
  nextVisitDate: string | null;
}

export interface Opportunity {
  kind: OpportunityKind;
  /** Quantos casos dependem de uma decisão de quem lê — NÃO é o total. */
  count: number;
  /** Casos que existem mas cuja ausência o sistema já justifica. */
  blockedCount: number;
  samples: OpportunityCase[];
}

export interface MyOpportunitiesResponse {
  myInsights: {
    status: boolean;
    message: string;
    data: {
      generatedAt: string;
      insights: Opportunity[];
    } | null;
  } | null;
}

export interface OpportunityCasesResponse {
  myInsightCases: {
    status: boolean;
    message: string;
    data: {
      kind: OpportunityKind;
      totalCount: number;
      cases: OpportunityCase[];
    } | null;
  } | null;
}

export interface OpportunitiesSellersResponse {
  opportunities_sellers: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
    totalCount: number;
  };
}

export interface OpportunitiesContentProps {
  /** Gestor (owner/admin): escolhe de quem são as oportunidades. */
  canSelectSeller: boolean;
  /** A empresa tem rotina no plano: dá para planejar a visita daqui. */
  canPlanVisits: boolean;
  /** Leitura já feita no servidor; null se o SSR falhou. */
  seed: MyOpportunitiesResponse | null;
}
