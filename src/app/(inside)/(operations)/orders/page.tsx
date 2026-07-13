import { executeServerQueries } from "@/services/graphql/getDataServer";
import OrdersContent from "./content";
import { ORDERS_QUERY } from "./gql";
import { ITEMS_PER_PAGE, QueryData } from "./interface";

const Page = async () => {
  // 1ª página da lista no servidor → semeia o cache do Apollo no cliente.
  // Os KPIs seguem no cliente (useQuery em content.tsx), por design.
  const data = await executeServerQueries<QueryData>({
    orders_list: {
      query: ORDERS_QUERY,
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
      cache: { tags: [`orders_list`], noCache: true },
    },
  });

  return <OrdersContent initialData={data} />;
};

export default Page;
