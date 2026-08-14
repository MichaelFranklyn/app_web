// API pública do serviço de planos.
// - PlanProvider/usePlan/useFeature: o que a empresa contratou, no cliente.
// - usePlanLimit: quanto de um teto já foi usado (custa contagem no backend).
// - requireFeaturePage/hasFeatureServer/getPlanContract: os mesmos fatos no servidor.
//
// A fonte da verdade é o backend (`app/core/domain/plans.py`): tudo aqui serve
// para a tela não oferecer o que a API vai recusar.
//
// `./server` fica FORA desta lista de propósito: importa `next/navigation` e o
// fetch com cookie, e arrastá-lo para um componente client quebraria o build.
// Quem roda no servidor importa `@/services/plan/server` direto.
export { PlanProvider, useFeature, usePlan } from "./PlanProvider";
export type { PlanContract } from "./PlanProvider";
export { MY_PLAN_FEATURES_QUERY, MY_PLAN_QUERY } from "./gql";
export { FEATURE_DESCRIPTION, FEATURE_LABEL, FEATURE_ORDER } from "./labels";
export type {
  MyPlan,
  MyPlanQueryData,
  PlanFeature,
  PlanLimitKey,
  PlanLimitUsage,
} from "./interface";
export { limitReachedMessage, usePlanLimit } from "./usePlanLimit";
