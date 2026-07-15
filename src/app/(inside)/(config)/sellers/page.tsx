import { executeServerQueries } from "@/services/graphql/getDataServer";
import { requireAdminPage } from "@/utils/auth/roleGuard";
import SellersContent from "./content";
import { SELLERS_QUERY } from "./_components/SellersTab/SellerListContent/gql";
import {
  ITEMS_PER_PAGE,
  QueryData as SellerListQueryData,
} from "./_components/SellersTab/SellerListContent/interface";
import { SELLERS_STATS_QUERY } from "./gql";
import { SellersStatsRaw } from "./interface";

const Page = async () => {
  // `sellers`/`sellersStats` são admin-only no backend — vendedor é
  // redirecionado antes de disparar as queries (senão a página crasha).
  await requireAdminPage();

  // Stats + 1ª página da aba padrão ("lista"). A lista semeia o cache do Apollo
  // no cliente (via useTableData) e pinta sem waterfall de rede.
  const data = await executeServerQueries<
    SellersStatsRaw & SellerListQueryData
  >({
    sellerStats: {
      query: SELLERS_STATS_QUERY,
      cache: { tags: [`sellers_stats`], noCache: true },
    },
    sellers_list: {
      query: SELLERS_QUERY,
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
      cache: { tags: [`sellers_list`], noCache: true },
    },
  });

  return (
    <SellersContent
      stats={data.sellerStats}
      initialData={{ sellers_list: data.sellers_list }}
    />
  );
};

export default Page;
