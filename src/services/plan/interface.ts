/**
 * O vocabulário do plano, espelhando `app/core/domain/plans.py`. Os valores são
 * os NOMES do enum GraphQL (maiúsculas), não os do banco — quem serializa é o
 * `EnumType` do Ariadne.
 */
export type PlanFeature =
  | "ROUTINES"
  | "ANALYTICS"
  | "REPORTS"
  | "BULK_IMPORT"
  | "GOALS"
  | "COMMISSIONS"
  | "NOTIFICATIONS";

export type PlanLimitKey = "USERS" | "SELLERS" | "CLIENTS" | "FACTORIES";

export interface PlanLimitUsage {
  key: PlanLimitKey;
  /** Nome do recurso no plural, como se diz ao usuário ("vendedores"). */
  label: string;
  /** Nulo = ilimitado. */
  limit: number | null;
  used: number;
  /**
   * Quem responde é o backend, com a mesma comparação que a mutation usa para
   * recusar. A tela não refaz a conta — se refizesse, um dia discordaria.
   */
  isAtLimit: boolean;
}

export interface MyPlan {
  code: string;
  /** Nome comercial ("Básico", "Pro"). */
  label: string;
  features: PlanFeature[];
  limits: PlanLimitUsage[];
}

export interface MyPlanQueryData {
  myPlan: {
    data: MyPlan | null;
  } | null;
}

/** Só o contrato, sem o uso — é o que os guards de página consultam. */
export interface MyPlanFeaturesQueryData {
  myPlan: {
    data: Pick<MyPlan, "code" | "label" | "features"> | null;
  } | null;
}
