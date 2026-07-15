import { executeServerQueries } from "@/services/graphql/getDataServer";
import { requireAdminPage } from "@/utils/auth/roleGuard";
import UsersContent from "./content";
import { USERS_QUERY } from "./gql";
import { ITEMS_PER_PAGE, QueryData } from "./interface";

const Page = async () => {
  // `users` é admin-only no backend — vendedor é redirecionado antes de
  // disparar a query (senão a página crasha).
  await requireAdminPage();

  // 1ª página da lista no servidor → semeia o cache do Apollo no cliente.
  const data = await executeServerQueries<QueryData>({
    users_list: {
      query: USERS_QUERY,
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
      cache: { tags: [`users_list`], noCache: true },
    },
  });

  return <UsersContent initialData={data} />;
};

export default Page;
