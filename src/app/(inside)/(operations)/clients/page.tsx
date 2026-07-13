import { executeServerQueries } from "@/services/graphql/getDataServer";
import ClientesContent from "./content";
import { CLIENTS_QUERY, CLIENT_STATS_QUERY } from "./gql";
import { ClientsStats, QueryData } from "./interface";
import { ITEMS_PER_PAGE } from "./utils";

const Page = async () => {
  const data = await executeServerQueries<ClientsStats & QueryData>({
    clientStats: {
      query: CLIENT_STATS_QUERY,
      cache: { tags: [`clients_stats`], noCache: true },
    },
    // 1ª página da lista, no shape da própria CLIENTS_QUERY → semeia o cache do
    // Apollo no cliente (via useTableData), pintando a lista sem waterfall.
    clients_list: {
      query: CLIENTS_QUERY,
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
      cache: { tags: [`clients_list`], noCache: true },
    },
  });

  return (
    <ClientesContent
      stats={{ clientStats: data.clientStats }}
      initialData={{ clients_list: data.clients_list }}
    />
  );
};

export default Page;
