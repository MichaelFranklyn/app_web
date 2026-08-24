import { UserData } from "@/app/(auth)/login/interface";
import { gqlFetch } from "@/services/graphql/gqlFetch";
import { getServerCookie } from "@/utils/cookies/serverCookie";

import InsightsContent from "./content";
import { MY_INSIGHTS_QUERY } from "./gql";
import { MyInsightsResponse } from "./interface";

// Papéis que enxergam a empresa inteira e escolhem de quem ver as pendências.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

/**
 * A leitura é de QUEM ABRE: o backend prende as pendências ao vendedor do token
 * e só aceita `sellerId` de gestor. Não há papel a barrar aqui — o vendedor é
 * justamente quem mais precisa desta tela.
 */
const Page = async () => {
  const userData = await getServerCookie<UserData>("userData");
  const canSelectSeller = MANAGER_ROLES.includes(userData?.role ?? "");

  // A leitura inteira vem do servidor: são nove consultas agregadas, e pagá-las
  // depois de o navegador baixar o JS deixaria a tela em esqueleto por segundos
  // — justo a tela que existe para ser lida em quinze minutos de intervalo.
  let seed: MyInsightsResponse | null = null;
  try {
    const { data } = await gqlFetch<MyInsightsResponse>({
      query: MY_INSIGHTS_QUERY,
      variables: { sellerId: null },
    });
    // Só semeia com CONTEÚDO: um seed sem `data` faria o cache-first acertar um
    // "hit" vazio e a tela mostraria "nada pendente" sem ter perguntado.
    seed = data?.myInsights?.data ? data : null;
  } catch {
    seed = null;
  }

  return <InsightsContent canSelectSeller={canSelectSeller} seed={seed} />;
};

export default Page;
