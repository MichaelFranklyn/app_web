import { executeServerQueries } from "@/services/graphql/getDataServer";
import { resolveOrderSellerContext } from "./_shared/sellerContext";
import OrdersContent from "./content";
import { ORDERS_QUERY } from "./gql";
import { ITEMS_PER_PAGE, QueryData } from "./interface";

const Page = async () => {
  // O vendedor não escolhe de quem é o pedido — o dele entra implícito.
  const { isManager: canFilterBySeller, ownSellerId } =
    await resolveOrderSellerContext();

  // 1ª página da lista no servidor → semeia o cache do Apollo no cliente.
  // Os KPIs seguem no cliente (useQuery em content.tsx), por design: eles
  // acompanham os filtros da tela, que só existem depois da hidratação.
  const data = await executeServerQueries<QueryData>({
    orders_list: {
      query: ORDERS_QUERY,
      variables: { input: { first: ITEMS_PER_PAGE, after: null } },
      cache: { tags: [`orders_list`] },
    },
  });

  return (
    <OrdersContent
      initialData={data}
      canFilterBySeller={canFilterBySeller}
      ownSellerId={ownSellerId}
    />
  );
};

export default Page;
