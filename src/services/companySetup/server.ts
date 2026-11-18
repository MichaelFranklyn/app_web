import { gqlFetch } from "@/services/graphql/gqlFetch";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import { cache } from "react";

import { COMPANY_SETUP_PENDING_QUERY, COMPANY_SETUP_STEPS_QUERY } from "./gql";

interface CompanySetupPendingQueryData {
  companySetupPending: boolean;
}

/**
 * A empresa ainda está na configuração inicial? Lido no servidor para a casca
 * já nascer com o item "Configuração inicial" no menu — buscar no cliente faria
 * o item aparecer meio segundo depois, empurrando o menu inteiro para baixo.
 *
 * Sem `unstable_cache`, de propósito: ao concluir a configuração o item tem de
 * sumir no `router.refresh()` seguinte, e um cache entre requests o deixaria
 * no menu por mais um tempo. A consulta é uma leitura de coluna.
 *
 * Qualquer falha responde `false`: o pior caso é o menu sem o atalho (a tela
 * segue acessível em Configurações), nunca a casca quebrada.
 */
export const getCompanySetupPending = cache(async (): Promise<boolean> => {
  try {
    const token = await getServerCookie<string>("token");
    if (!token) return false;
    const response = await gqlFetch<CompanySetupPendingQueryData>(
      { query: COMPANY_SETUP_PENDING_QUERY },
      token
    );
    return response.data?.companySetupPending === true;
  } catch {
    return false;
  }
});

export interface CompanySetupStepState {
  key: string;
  isDone: boolean;
  isRequired: boolean;
}

interface CompanySetupStepsQueryData {
  companySetupProgress: {
    data: { steps: CompanySetupStepState[] } | null;
  } | null;
}

/**
 * Os passos da configuração inicial, na ordem do backend — para a página de
 * um passo travado mandar de volta à lista quem entrou pelo endereço.
 *
 * Qualquer falha responde `null` e ninguém é redirecionado: a trava é guia,
 * não segurança (o backend valida cada importação por conta própria).
 */
export const getCompanySetupSteps = cache(
  async (): Promise<CompanySetupStepState[] | null> => {
    try {
      const token = await getServerCookie<string>("token");
      if (!token) return null;
      const response = await gqlFetch<CompanySetupStepsQueryData>(
        { query: COMPANY_SETUP_STEPS_QUERY },
        token
      );
      return response.data?.companySetupProgress?.data?.steps ?? null;
    } catch {
      return null;
    }
  }
);
