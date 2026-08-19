import { UserData } from "@/app/(auth)/login/interface";
import { executeServerQueries } from "@/services/graphql/getDataServer";
import { gqlFetch } from "@/services/graphql/gqlFetch";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import OrdersContent from "./content";
import { MY_SELLER_PROFILE_QUERY, ORDERS_QUERY } from "./gql";
import { ITEMS_PER_PAGE, QueryData } from "./interface";

interface MySellerProfile {
  mySellerProfile: { status: boolean; data: { id: string } | null };
}

/**
 * Perfil de vendedor de quem abriu a tela, para o pedido novo sair no nome
 * certo sem perguntar. Vem do cookie; só vai à rede quando ele não traz o dado
 * (sessão aberta antes de o cookie passar a carregá-lo). Falha vira `null`: o
 * backend ainda força o vendedor do token na criação.
 */
async function resolveOwnSellerId(
  userData: UserData | null
): Promise<string | null> {
  if (userData?.sellerId) return userData.sellerId;
  if (userData?.role !== "SELLER") return null;
  try {
    const { data } = await gqlFetch<MySellerProfile>({
      query: MY_SELLER_PROFILE_QUERY,
    });
    return data?.mySellerProfile?.data?.id ?? null;
  } catch {
    return null;
  }
}

// Papéis que enxergam os pedidos da empresa inteira e podem filtrar por vendedor.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

const Page = async () => {
  // Papel resolvido no servidor (mesmo cookie `userData` do login): evita o
  // salto de hidratação e libera o filtro de vendedor só para gestor.
  const userData = await getServerCookie<UserData>("userData");
  const canFilterBySeller = MANAGER_ROLES.includes(userData?.role ?? "");
  // O vendedor não escolhe de quem é o pedido — a lista de vendedores é
  // admin-only no backend. O dele vem daqui e entra implícito na criação.
  const ownSellerId = await resolveOwnSellerId(userData ?? null);

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
