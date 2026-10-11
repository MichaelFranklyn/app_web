import { UserData } from "@/app/(auth)/login/interface";
import { gqlFetch } from "@/services/graphql/gqlFetch";
import { isAdminRole } from "@/utils/auth/roles";
import { getServerCookie } from "@/utils/cookies/serverCookie";

import PendingContent from "./content";
import { MY_PENDING_ITEMS_QUERY } from "./gql";
import { MyPendingItemsResponse } from "./interface";
import { pendingVariables } from "./utils";

/**
 * A lista é de QUEM ABRE: o backend prende as pendências ao vendedor do token
 * e só aceita `sellerId` de gestor. Não há papel a barrar aqui — o vendedor é
 * justamente quem mais precisa desta tela.
 */
const Page = async () => {
  const userData = await getServerCookie<UserData>("userData");
  const canSelectSeller = isAdminRole(userData?.role);

  // A primeira página (sem filtro) vem do servidor: a leitura varre visitas,
  // carteira e pedidos, e pagá-la só depois de o navegador baixar o JS deixaria
  // em esqueleto a tela que se abre para saber o que fazer agora. Quem chega com
  // filtro na URL busca no cliente — as variables não batem com as daqui.
  let seed: MyPendingItemsResponse | null = null;
  try {
    const { data } = await gqlFetch<MyPendingItemsResponse>({
      query: MY_PENDING_ITEMS_QUERY,
      variables: pendingVariables({}, 1, canSelectSeller),
    });
    // Só semeia com CONTEÚDO: um seed sem `data` faria o cache acertar um "hit"
    // vazio e a tela mostraria "nada pendente" sem ter perguntado.
    seed = data?.myPendingItems?.data ? data : null;
  } catch {
    seed = null;
  }

  return <PendingContent canSelectSeller={canSelectSeller} seed={seed} />;
};

export default Page;
