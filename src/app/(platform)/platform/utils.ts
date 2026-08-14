import { PlanFeature, PlanLimitKey } from "@/services/plan";

import {
  AttentionSeverity,
  FeatureAdoption,
  PlatformEngagement,
  PlatformGrowthPoint,
  PlatformOperation,
  PlanCatalogEntry,
  PlatformOverview,
  TenantTrend,
} from "./interface";

/** Janela do gráfico de crescimento. Doze meses cobrem um ciclo anual inteiro. */
export const GROWTH_MONTHS = 12;

const MONTH_LABELS = [
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

/**
 * "2026-08" → "ago/26". O eixo do gráfico tem doze rótulos e pouca largura;
 * a data por extenso não caberia sem girar o texto.
 */
export const formatMonthLabel = (month: string): string => {
  const [year, monthNumber] = month.split("-");
  const index = Number(monthNumber) - 1;
  const label = MONTH_LABELS[index] ?? monthNumber;
  return `${label}/${year.slice(2)}`;
};

/**
 * Que fatia das empresas deu sinal de vida na janela.
 *
 * O denominador é o total de empresas ATIVAS, não o total absoluto: contar as
 * suspensas rebaixaria o número por empresas que estão impedidas de entrar —
 * a métrica mediria a própria decisão do SU em vez de medir adoção.
 */
export const engagementRate = (overview: PlatformOverview): number => {
  if (overview.activeCompanies === 0) return 0;
  return Math.round(
    (overview.engagedCompanies / overview.activeCompanies) * 100
  );
};

/** Empresas ativas que NÃO deram sinal de vida na janela. */
export const dormantCompanies = (overview: PlatformOverview): number =>
  Math.max(0, overview.activeCompanies - overview.engagedCompanies);

/**
 * A série vem completa do backend (meses sem movimento chegam zerados), então
 * um total zerado significa mesmo "nada aconteceu" — e não "não veio dado".
 * A distinção importa para a tela escolher entre gráfico e estado vazio.
 */
export const hasGrowthMovement = (points: PlatformGrowthPoint[]): boolean =>
  points.some((p) => p.newCompanies > 0 || p.newUsers > 0 || p.orders > 0);

// ─── Retenção ────────────────────────────────────────────────────────────────

/** Permanência de uma célula da grade, em porcentagem. */
export const retentionPercent = (active: number, cohortSize: number): number =>
  cohortSize > 0 ? Math.round((active / cohortSize) * 100) : 0;

/**
 * A cor de uma célula da grade.
 *
 * A escala é de PERMANÊNCIA, então o vermelho fica embaixo: metade da turma
 * sumida é o achado que a grade existe para mostrar. Os cortes são largos de
 * propósito — a grade se lê pelo formato da mancha, não célula a célula.
 */
export const retentionTone = (
  percent: number
): "strong" | "good" | "weak" | "bad" | "empty" => {
  if (percent === 0) return "empty";
  if (percent >= 75) return "strong";
  if (percent >= 50) return "good";
  if (percent >= 25) return "weak";
  return "bad";
};

export const RETENTION_TONE_CLASS: Record<
  ReturnType<typeof retentionTone>,
  string
> = {
  strong: "bg-(--green)/85 text-white",
  good: "bg-(--green)/45",
  weak: "bg-(--amber)/40",
  bad: "bg-(--red)/35",
  empty: "bg-(--bg3) text-(--muted)",
};

/**
 * A célula cai no mês corrente?
 *
 * O mês corrente está pela metade e aparece na PONTA de cada turma, em offsets
 * diferentes. Sem marcá-lo, a diagonal final da grade se lê como queda geral —
 * quando é só o mês que ainda não acabou.
 */
export const isPartialCell = (
  cohort: string,
  offset: number,
  currentMonth: string
): boolean => {
  const [year, month] = cohort.split("-").map(Number);
  const total = year * 12 + (month - 1) + offset;
  const key = `${Math.floor(total / 12)}-${String((total % 12) + 1).padStart(2, "0")}`;
  return key === currentMonth;
};

/** "2026-07" → "jul/26", igual ao eixo do gráfico de crescimento. */
export const cohortLabel = formatMonthLabel;

// ─── Pessoas ativas ──────────────────────────────────────────────────────────

/**
 * A leitura da aderência (DAU/MAU).
 *
 * Os cortes vêm do que a ferramenta É: um sistema de trabalho diário do
 * vendedor, não um relatório mensal. Acima de 30% significa que boa parte das
 * pessoas abre o sistema num dia qualquer; abaixo de 10%, elas entram quando
 * precisam de alguma coisa — que é o retrato de uma ferramenta de consulta,
 * não de operação.
 */
export const stickinessTone = (
  percent: number
): "ok" | "atencao" | "urgente" => {
  if (percent >= 30) return "ok";
  if (percent >= 10) return "atencao";
  return "urgente";
};

/**
 * Quantas pessoas do período NÃO apareceram na última semana.
 *
 * É a leitura que o total esconde: cem pessoas no mês com dez na semana é uma
 * base que já foi embora, e os dois números sozinhos não dizem isso.
 */
export const inactiveThisWeek = (engagement: PlatformEngagement): number =>
  Math.max(0, engagement.monthlyActive - engagement.weeklyActive);

/** "2026-08-12" → "12/08". Mesmo formato do eixo do pulso. */
export const formatShortDay = (day: string): string => {
  const [, month, date] = day.split("-");
  return date && month ? `${date}/${month}` : day;
};

// ─── Fila de trabalho ────────────────────────────────────────────────────────

export const SEVERITY_COLOR: Record<
  AttentionSeverity,
  "red" | "amber" | "blue"
> = {
  CRITICAL: "red",
  WARNING: "amber",
  INFO: "blue",
};

export const SEVERITY_LABEL: Record<AttentionSeverity, string> = {
  CRITICAL: "Agir agora",
  WARNING: "Acompanhar",
  INFO: "Informativo",
};

// ─── Saúde da carteira ───────────────────────────────────────────────────────

export const TREND_LABEL: Record<TenantTrend, string> = {
  IDLE: "Parada",
  NEW: "Começando",
  GROWING: "Crescendo",
  STABLE: "Estável",
  DECLINING: "Caindo",
};

export const TREND_COLOR: Record<
  TenantTrend,
  "red" | "amber" | "green" | "blue" | "muted"
> = {
  IDLE: "red",
  DECLINING: "amber",
  NEW: "blue",
  STABLE: "muted",
  GROWING: "green",
};

/**
 * A variação como texto, com sinal. `null` (sem base de comparação) vira "—" e
 * não "0%": zero afirmaria estabilidade onde não há o que comparar.
 */
export const formatChange = (percent: number | null): string => {
  if (percent === null) return "—";
  const rounded = Math.round(percent);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
};

// ─── Operação ────────────────────────────────────────────────────────────────

/** Fatia dos clientes vinculados que comprou na janela. */
export const positivationRate = (operation: PlatformOperation): number => {
  if (operation.activeClients === 0) return 0;
  return Math.round(
    (operation.positivatedClients / operation.activeClients) * 100
  );
};

/** Fatia das visitas planejadas que foi de fato realizada. */
export const visitCompletionRate = (operation: PlatformOperation): number => {
  if (operation.visitsPlanned === 0) return 0;
  return Math.round((operation.visitsDone / operation.visitsPlanned) * 100);
};

// ─── Adoção ──────────────────────────────────────────────────────────────────

export const adoptionRate = (item: FeatureAdoption): number => {
  if (item.totalTenants === 0) return 0;
  return Math.round((item.tenantsUsing / item.totalTenants) * 100);
};

/**
 * Vive no PAI porque duas telas do console leem a mesma coisa: a lista de
 * histórico e o cartão de atividade da ficha da empresa. Fosse ao lado de uma
 * delas, a outra importaria de uma irmã.
 */
/**
 * Rótulo legível para as operações mais comuns.
 *
 * O registro é automático e guarda o nome do campo da mutation, sem semântica
 * de negócio. Traduzir aqui é uma escolha consciente: quem lê a tela pensa em
 * "faturou um pedido", não em `invoiceOrder`. Operação sem tradução aparece
 * com o nome cru — melhor um nome técnico que um rótulo genérico e falso.
 */
export const OPERATION_LABEL: Record<string, string> = {
  login: "Entrou no sistema",
  resetPassword: "Redefiniu a senha",
  registerCompany: "Criou conta (auto-cadastro)",

  createOrder: "Criou pedido",
  updateOrder: "Alterou pedido",
  deleteOrder: "Excluiu pedido",
  invoiceOrder: "Faturou pedido",
  reviseOrderInvoice: "Revisou faturamento",
  uninvoiceOrder: "Desfez faturamento",
  markOrderDelivered: "Marcou entrega",

  createCompanyClient: "Vinculou cliente",
  updateCompanyClient: "Alterou cliente",
  deleteCompanyClient: "Removeu cliente",

  createUser: "Criou pessoa",
  updateUser: "Alterou pessoa",
  deleteUser: "Removeu pessoa",

  createVisitSchedule: "Gerou rotina",
  updateVisitScheduleItem: "Atualizou visita",

  // Ações de plataforma. Aparecem aqui também porque o SU age pelo mesmo
  // GraphQL — a leitura semântica delas fica na trilha de auditoria.
  setTenantStatus: "Suspendeu/reativou empresa",
  updateTenantPlan: "Alterou plano",
  issueTenantAccessLink: "Emitiu link de acesso",
  impersonateUser: "Entrou como usuário",
  provisionCompany: "Provisionou empresa",
};

export const operationLabel = (operation: string): string =>
  OPERATION_LABEL[operation] ?? operation;

/** "2026-08-13" → "13/08". O eixo do gráfico tem 30 rótulos e pouca largura. */
export const formatDayLabel = (day: string): string => {
  const [, month, date] = day.split("-");
  return date && month ? `${date}/${month}` : day;
};

/**
 * Rótulos de papel e leitura do último acesso.
 *
 * Vivem no PAI porque a lista de empresas, a ficha da empresa, a lista de
 * pessoas e a ficha da pessoa usam os mesmos — antes moravam em `companies/` e
 * eram alcançados de fora, inclusive de dentro de uma sub-rota.
 */
export const ROLE_LABEL: Record<string, string> = {
  SU: "Super Admin",
  SUPPORT: "Suporte",
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  SELLER: "Vendedor",
};

/**
 * Quantos dias desde o último login de alguém da empresa. `null` = ninguém
 * entrou nunca, que é diferente de "entrou há muito tempo" — a tela distingue
 * os dois, porque um é conta abandonada e o outro é conta que nunca começou.
 */
export const daysSinceLogin = (
  lastLoginAt: string | null,
  today: Date = new Date()
): number | null => {
  if (!lastLoginAt) return null;
  const last = new Date(lastLoginAt);
  if (Number.isNaN(last.getTime())) return null;
  const diff = today.getTime() - last.getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
};

export type ActivityTone = "ok" | "atencao" | "urgente" | "neutral";

/**
 * O tom da coluna de atividade.
 *
 * Uma semana sem ninguém entrar já é sinal: o sistema é ferramenta de trabalho
 * diário do vendedor, não relatório mensal. Trinta dias é abandono.
 */
export const activityTone = (days: number | null): ActivityTone => {
  if (days === null) return "neutral";
  if (days <= 7) return "ok";
  if (days <= 30) return "atencao";
  return "urgente";
};

export const activityLabel = (days: number | null): string => {
  if (days === null) return "Nunca entrou";
  if (days === 0) return "Hoje";
  if (days === 1) return "Ontem";
  return `Há ${days} dias`;
};

// ─── Efeito de uma troca de plano ─────────────────────────────── //

export interface PlanChange {
  /** Recursos que a empresa PASSA a ter. */
  gained: PlanFeature[];
  /** Recursos que ela PERDE — o lado que precisa ser dito em voz alta. */
  lost: PlanFeature[];
  /** Tetos que mudam, com o antes e o depois. */
  limitChanges: {
    key: PlanLimitKey;
    label: string;
    from: number | null;
    to: number | null;
    /** Verdadeiro quando o teto novo é MENOR que o atual (ou passa a existir). */
    isTighter: boolean;
  }[];
}

/**
 * O que muda ao trocar o plano de uma empresa.
 *
 * Existe porque "trocar de basic para pro" não diz nada a quem está na tela: o
 * que importa é o que a empresa ganha e, principalmente, o que ela PERDE — um
 * downgrade tira telas inteiras de gente que estava usando, e o SU precisa
 * enxergar isso antes de salvar, não depois do telefone tocar.
 *
 * Compara só o catálogo, sem os overrides do tenant: os overrides são editados
 * no mesmo formulário, e misturá-los aqui responderia uma pergunta que ninguém
 * fez ("e se eu mudar o plano mas mantiver o teto manual?").
 */
export const describePlanChange = (
  from: PlanCatalogEntry | null,
  to: PlanCatalogEntry | null
): PlanChange => {
  if (!from || !to || from.code === to.code)
    return { gained: [], lost: [], limitChanges: [] };

  const toLimit = new Map(to.limits.map((l) => [l.key, l.limit]));

  return {
    gained: to.features.filter((f) => !from.features.includes(f)),
    lost: from.features.filter((f) => !to.features.includes(f)),
    limitChanges: from.limits
      .filter((l) => toLimit.get(l.key) !== l.limit)
      .map((l) => {
        const next = toLimit.get(l.key) ?? null;
        return {
          key: l.key,
          label: l.label,
          from: l.limit,
          to: next,
          // Nulo é "sem teto": sair de nulo para qualquer número aperta, e
          // chegar a nulo nunca aperta. Comparar os dois como números faria
          // "sem limite" perder para 3.
          isTighter: next !== null && (l.limit === null || next < l.limit),
        };
      }),
  };
};
