import { executeServerQueries } from "@/services/graphql/getDataServer";
import ClientesContent from "./content";
import { CLIENT_STATS_QUERY } from "./gql";
import { ClientsStats } from "./interface";

const Page = async () => {
  const stats = await executeServerQueries<ClientsStats>({
    clientStats: {
      query: CLIENT_STATS_QUERY,
      cache: { tags: [`clients_stats`], noCache: true },
    },
  });

  return <ClientesContent stats={stats} />;
};

export default Page;
