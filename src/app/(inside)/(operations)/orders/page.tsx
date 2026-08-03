import { UserData } from "@/app/(auth)/login/interface";
import { executeServerQueries } from "@/services/graphql/getDataServer";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import OrdersContent from "./content";
import { ORDERS_QUERY } from "./gql";
import { ITEMS_PER_PAGE, QueryData } from "./interface";

// Papéis que enxergam os pedidos da empresa inteira e podem filtrar por vendedor.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

const Page = async () => {
  // Papel resolvido no servidor (mesmo cookie `userData` do login): evita o
  // salto de hidratação e libera o filtro de vendedor só para gestor.
  const userData = await getServerCookie<UserData>("userData");
  const canFilterBySeller = MANAGER_ROLES.includes(userData?.role ?? "");

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
    <OrdersContent initialData={data} canFilterBySeller={canFilterBySeller} />
  );
};

export default Page;
