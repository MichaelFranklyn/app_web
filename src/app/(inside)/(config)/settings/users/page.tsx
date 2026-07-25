import { executeServerQueries } from "@/services/graphql/getDataServer";
import { requireAdminPage } from "@/utils/auth/roleGuard";
import UsersContent from "./content";
import { SELLERS_STATS_QUERY, USERS_QUERY } from "./gql";
import { ITEMS_PER_PAGE, QueryData, SellersStatsRaw } from "./interface";

const Page = async () => {
  // `users`/`sellersStats` são admin-only no backend — vendedor é redirecionado
  // antes de disparar as queries (senão a página crasha).
  await requireAdminPage("/profile");

  // Stats + 1ª página da lista no servidor → semeia o cache do Apollo no cliente.
  const data = await executeServerQueries<QueryData & SellersStatsRaw>({
    users_list: {
      query: USERS_QUERY,
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
      cache: { tags: [`users_list`], noCache: true },
    },
    sellerStats: {
      query: SELLERS_STATS_QUERY,
      cache: { tags: [`sellers_stats`], noCache: true },
    },
  });

  return (
    <UsersContent
      initialData={{ users_list: data.users_list }}
      stats={data.sellerStats}
    />
  );
};

export default Page;
