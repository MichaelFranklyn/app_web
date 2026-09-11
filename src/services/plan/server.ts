import { gqlFetch } from "@/services/graphql/gqlFetch";
import { parseJwtServer } from "@/utils/auth/jwt";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import { unstable_cache } from "next/cache";
import { redirect } from "next/navigation";
import { cache } from "react";

import { MY_PLAN_FEATURES_QUERY } from "./gql";
import { MyPlanFeaturesQueryData, PlanFeature } from "./interface";

/** Fallback de quem não conseguiu ler o plano (sessão caindo, backend fora).
 * Vazio, e não "tudo liberado": a tela some, o backend recusaria de qualquer
 * forma, e o oposto — menu cheio que estoura erro a cada clique — é pior. */
const NO_PLAN = { code: "", label: "", features: [] as PlanFeature[] };

/**
 * Quanto tempo o contrato vale sem perguntar de novo ao backend.
 *
 * O layout de `(inside)` espera por esta consulta ANTES de a página começar a
 * renderizar — é uma ida ao backend somada ao tempo até a primeira pintura de
 * toda tela de dentro, em toda carga cheia. E o plano de uma empresa muda
 * quando alguém contrata ou troca de plano: uma vez a cada meses, não a cada
 * navegação.
 *
 * Um minuto é o compromisso: apaga o custo da repetição sem deixar o menu
 * desatualizado por tempo perceptível depois de uma troca de plano. Quem
 * decide de verdade é o backend, que recusa o que não foi contratado — a tela
 * aqui só escolhe o que oferecer.
 */
const PLAN_TTL_SECONDS = 60;

/** Busca o contrato de fato. Fora do `unstable_cache` de propósito na leitura
 *  do token: `cookies()` não pode ser chamado lá dentro (mesmo motivo pelo qual
 *  `executeServerQueries` recebe o token por argumento). */
const fetchPlanContract = async (token: string | null) => {
  const response = await gqlFetch<MyPlanFeaturesQueryData>(
    { query: MY_PLAN_FEATURES_QUERY },
    token
  );
  return response.data?.myPlan?.data ?? NO_PLAN;
};

/**
 * O contrato da empresa, no servidor. `cache` do React deduplica dentro do
 * mesmo request: o layout e o guard da página perguntam, e sai um fetch só.
 * O `unstable_cache` por baixo estende isso ENTRE requests do mesmo usuário
 * (ver `PLAN_TTL_SECONDS`), tirando um round-trip do caminho crítico de cada
 * carga cheia.
 *
 * Não pede `limits` de propósito — seria uma contagem por teto em toda
 * navegação para responder algo que só a tela do plano mostra.
 */
export const getPlanContract = cache(async () => {
  const token = await getServerCookie<string>("token");
  const userId = (token ? parseJwtServer(token) : null)?.sub ?? "anon";

  try {
    // A falha NÃO entra no cache: `unstable_cache` só guarda o que retorna, e
    // a exceção sobe para o `catch` de fora. Sem isso, uma instabilidade de
    // um segundo deixaria o usuário um minuto inteiro com o menu vazio.
    const cached = unstable_cache(
      fetchPlanContract,
      ["plan-contract", userId],
      {
        tags: ["global", `user-${userId}`, `plan-${userId}`],
        revalidate: PLAN_TTL_SECONDS,
      }
    );
    return await cached(token);
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
