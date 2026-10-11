import { UserData } from "@/app/(auth)/login/interface";
import { gqlFetch } from "@/services/graphql/gqlFetch";
import { hasFeatureServer } from "@/services/plan/server";
import { isAdminRole } from "@/utils/auth/roles";
import { getServerCookie } from "@/utils/cookies/serverCookie";

import OpportunitiesContent from "./content";
import { MY_OPPORTUNITIES_QUERY } from "./gql";
import { MyOpportunitiesResponse } from "./interface";

/**
 * A leitura é de QUEM ABRE: o backend prende as oportunidades ao vendedor do
 * token e só aceita `sellerId` de gestor. Não há papel a barrar aqui.
 */
const Page = async () => {
  const userData = await getServerCookie<UserData>("userData");
  const canSelectSeller = isAdminRole(userData?.role);
  // Planejar a visita é da rotina: sem ela no plano o botão nem aparece.
  const canPlanVisits = await hasFeatureServer("ROUTINES");

  // A leitura vem do servidor: pagá-la depois de o navegador baixar o JS
  // deixaria a tela em esqueleto justo quando se abre para decidir.
  let seed: MyOpportunitiesResponse | null = null;
  try {
    const { data } = await gqlFetch<MyOpportunitiesResponse>({
      query: MY_OPPORTUNITIES_QUERY,
      variables: { sellerId: null },
    });
    // Só semeia com CONTEÚDO: um seed sem `data` faria o cache-first acertar um
    // "hit" vazio e a tela diria "nenhuma oportunidade" sem ter perguntado.
    seed = data?.myInsights?.data ? data : null;
  } catch {
    seed = null;
  }

  return (
    <OpportunitiesContent
      canSelectSeller={canSelectSeller}
      canPlanVisits={canPlanVisits}
      seed={seed}
    />
  );
};

export default Page;
