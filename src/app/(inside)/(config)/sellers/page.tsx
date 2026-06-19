import { executeServerQueries } from "@/services/graphql/getDataServer";
import SellersContent from "./content";
import { SELLERS_STATS_QUERY } from "./gql";
import { SellersStatsRaw } from "./interface";

const Page = async () => {
  const stats = await executeServerQueries<SellersStatsRaw>({
    sellerStats: {
      query: SELLERS_STATS_QUERY,
      cache: { tags: [`sellers_stats`], noCache: true },
    },
  });

  return <SellersContent stats={stats.sellerStats} />;
};

export default Page;
