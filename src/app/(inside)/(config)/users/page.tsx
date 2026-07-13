import { executeServerQueries } from "@/services/graphql/getDataServer";
import UsersContent from "./content";
import { USERS_QUERY } from "./gql";
import { ITEMS_PER_PAGE, QueryData } from "./interface";

const Page = async () => {
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
