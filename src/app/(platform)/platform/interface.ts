import { PlanFeature, PlanLimitKey } from "@/services/plan";

export interface PlatformOverview {
  totalCompanies: number;
  activeCompanies: number;
  suspendedCompanies: number;
  trialCompanies: number;
  newCompaniesInPeriod: number;
  totalUsers: number;
  activeUsersInPeriod: number;
  neverLoggedUsers: number;
  /** Empresas com pelo menos um login na janela — o corte de "cliente vivo". */
  engagedCompanies: number;
  totalSellers: number;
  totalClients: number;
  totalFactoryLinks: number;
  totalOrders: number;
  ordersInPeriod: number;
  gmvInPeriod: number;
}

export interface PlatformGrowthPoint {
  /** Chave "YYYY-MM", já ordenável como texto. */
  month: string;
  newCompanies: number;
  newUsers: number;
  orders: number;
  gmv: number;
}

export type AttentionKind =
  | "TRIAL_EXPIRED"
  | "TRIAL_EXPIRING"
  | "NEVER_LOGGED_IN"
  | "DORMANT";

export type AttentionSeverity = "CRITICAL" | "WARNING" | "INFO";

export interface AttentionItem {
  kind: AttentionKind;
  severity: AttentionSeverity;
  companyId: string | null;
  companyName: string | null;
  detail: string;
}

export interface PlatformOperation {
  activeClients: number;
  /** Clientes distintos que compraram na janela. */
  positivatedClients: number;
  visitsPlanned: number;
  visitsDone: number;
  averageTicket: number;
  /** Quem registrou pedido na janela, não quem tem cadastro. */
  activeSellers: number;
  ordersPerSeller: number;
}

export type TenantTrend = "IDLE" | "NEW" | "GROWING" | "STABLE" | "DECLINING";

export interface TenantHealthRow {
  companyId: string;
  companyName: string;
  isActive: boolean;
  ordersCurrent: number;
  ordersPrevious: number;
  gmvCurrent: number;
  gmvPrevious: number;
  /** Nulo quando não houve faturamento antes: sem base não há variação. */
  changePercent: number | null;
  trend: TenantTrend;
  lastOrderDate: string | null;
}

export interface RetentionCohort {
  /** Mês de entrada, "YYYY-MM". */
  cohort: string;
  companies: number;
  /**
   * Empresas da turma que operaram em cada mês de vida (índice 0 = mês de
   * entrada). Mais curto nas turmas recentes: uma coorte só tem tantos meses
   * quanto já viveu.
   */
  values: number[];
}

export interface PlatformRetention {
  cohorts: RetentionCohort[];
  /**
   * Curva média por mês de vida, em %, sem o mês corrente. Ponto nulo = nenhuma
   * turma serve de base ainda; zero ali afirmaria que ninguém ficou.
   */
  overall: (number | null)[];
  /** Mês corrente ("YYYY-MM") — sempre incompleto, marcado na grade. */
  currentMonth: string;
  months: number;
}

export interface EngagementPoint {
  day: string;
  users: number;
  companies: number;
  actions: number;
}

export interface PlatformEngagement {
  daily: EngagementPoint[];
  /** Média de pessoas por dia ÚTIL — fim de semana entra na série, não na média. */
  dailyAverage: number;
  weeklyActive: number;
  monthlyActive: number;
  activeCompanies: number;
  /** `dailyAverage` sobre `monthlyActive`, em %. A medida de hábito. */
  stickiness: number;
  peakUsers: number;
  peakDay: string | null;
}

export interface FeatureAdoption {
  feature: string;
  label: string;
  tenantsUsing: number;
  totalTenants: number;
}

export interface OverviewQueryData {
  platformOverview: { data: PlatformOverview | null };
}

export interface GrowthQueryData {
  platformGrowth: { data: PlatformGrowthPoint[] | null };
}

export interface AttentionQueryData {
  platformAttention: { data: AttentionItem[] | null };
}

export interface OperationQueryData {
  platformOperation: { data: PlatformOperation | null };
}

export interface TenantHealthQueryData {
  platformTenantHealth: { data: TenantHealthRow[] | null };
}

export interface AdoptionQueryData {
  platformFeatureAdoption: { data: FeatureAdoption[] | null };
}

export interface RetentionQueryData {
  platformRetention: { data: PlatformRetention | null };
}

export interface EngagementQueryData {
  platformEngagement: { data: PlatformEngagement | null };
}

export interface PlatformHomeProps {
  seedOverview: OverviewQueryData | null;
  seedGrowth: GrowthQueryData | null;
  seedAttention: AttentionQueryData | null;
  seedOperation: OperationQueryData | null;
  seedHealth: TenantHealthQueryData | null;
  seedAdoption: AdoptionQueryData | null;
  seedRetention: RetentionQueryData | null;
  seedEngagement: EngagementQueryData | null;
}

/**
 * Uma fatia do resumo de atividade: uma operação, ou um dia.
 *
 * Vive no PAI porque a tela de histórico e a curva de uso da ficha da empresa
 * leem a MESMA query (`platformActivitySummary`) — o tipo ao lado de uma delas
 * faria a outra importar de uma irmã.
 */
export interface ActivitySummaryItem {
  key: string;
  total: number;
  errors: number;
}

export interface ActivitySummary {
  totalActions: number;
  totalErrors: number;
  byOperation: ActivitySummaryItem[];
  byDay: ActivitySummaryItem[];
}

/**
 * Um plano do catálogo, como o backend o descreve (`planCatalog`).
 *
 * Vive no PAI porque duas telas o leem: a referência em `/platform/plans` e o
 * modal que troca o plano de uma empresa. É a mesma matriz aplicada em runtime
 * — o console não guarda cópia própria, que envelheceria em silêncio.
 */
export interface PlanCatalogLimit {
  key: PlanLimitKey;
  label: string;
  /** Nulo = o plano não impõe teto para esse recurso. */
  limit: number | null;
}

export interface PlanCatalogEntry {
  code: string;
  label: string;
  features: PlanFeature[];
  limits: PlanCatalogLimit[];
}

export interface PlanCatalogQueryData {
  planCatalog: { data: PlanCatalogEntry[] | null } | null;
}
