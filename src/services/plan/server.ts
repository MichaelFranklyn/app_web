import { gqlFetch } from "@/services/graphql/gqlFetch";
import { redirect } from "next/navigation";
import { cache } from "react";

import { MY_PLAN_FEATURES_QUERY } from "./gql";
import { MyPlanFeaturesQueryData, PlanFeature } from "./interface";

/** Fallback de quem não conseguiu ler o plano (sessão caindo, backend fora).
 * Vazio, e não "tudo liberado": a tela some, o backend recusaria de qualquer
 * forma, e o oposto — menu cheio que estoura erro a cada clique — é pior. */
const NO_PLAN = { code: "", label: "", features: [] as PlanFeature[] };

/**
 * O contrato da empresa, no servidor. `cache` do React deduplica dentro do
 * mesmo request: o layout e o guard da página perguntam, e sai um fetch só.
 *
 * Não pede `limits` de propósito — seria uma contagem por teto em toda
 * navegação para responder algo que só a tela do plano mostra.
 */
export const getPlanContract = cache(async () => {
  try {
    const response = await gqlFetch<MyPlanFeaturesQueryData>({
      query: MY_PLAN_FEATURES_QUERY,
    });
    return response.data?.myPlan?.data ?? NO_PLAN;
  } catch {
    // Sessão expirada cai aqui. Quem trata é o middleware de autenticação —
    // derrubar a casca inteira com um throw só trocaria o redirect de login por
    // uma tela de erro.
    return NO_PLAN;
  }
});

export const hasFeatureServer = async (
  feature: PlanFeature
): Promise<boolean> => (await getPlanContract()).features.includes(feature);

/**
 * Guard das páginas que dependem de um recurso do plano. Espelha o guard de
 * papel (`requireAdminPage`) e existe pelo mesmo motivo: sem ele a tela abre,
 * dispara as queries SSR e só então estoura "recurso não incluído" em cada uma.
 *
 * O redirect leva ao dashboard, que todo plano tem.
 */
export const requireFeaturePage = async (
  feature: PlanFeature,
  redirectTo: string = "/dashboard"
): Promise<void> => {
  if (!(await hasFeatureServer(feature))) redirect(redirectTo);
};
