import { UserData } from "@/app/(auth)/login/interface";
import { executeServerQueries } from "@/services/graphql/getDataServer";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import ClientesContent from "./content";
import { CLIENTS_QUERY, CLIENT_STATS_QUERY } from "./gql";
import { ClientsStats, QueryData } from "./interface";
import { ITEMS_PER_PAGE } from "./utils";

// Papéis que enxergam a carteira inteira e podem escolher de qual vendedor ver.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

const Page = async () => {
  // Papel resolvido no servidor (mesmo cookie `userData` do login): evita o salto
  // de hidratação e libera o filtro de vendedor só para gestor.
  const userData = await getServerCookie<UserData>("userData");
  const canFilterBySeller = MANAGER_ROLES.includes(userData?.role ?? "");

  const data = await executeServerQueries<ClientsStats & QueryData>({
    clientStats: {
      query: CLIENT_STATS_QUERY,
      cache: { tags: [`clients_stats`] },
    },
    // 1ª página da lista, no shape da própria CLIENTS_QUERY → semeia o cache do
    // Apollo no cliente (via useTableData), pintando a lista sem waterfall.
    clients_list: {
      query: CLIENTS_QUERY,
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
      cache: { tags: [`clients_list`] },
    },
  });

  return (
    <ClientesContent
      stats={{ clientStats: data.clientStats }}
      initialData={{ clients_list: data.clients_list }}
      canFilterBySeller={canFilterBySeller}
    />
  );
};

export default Page;
