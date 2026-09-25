import { UserData } from "@/app/(auth)/login/interface";
import { gqlFetch } from "@/services/graphql/gqlFetch";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import { MY_SELLER_PROFILE_QUERY } from "../gql";

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

/**
 * Quem está criando/listando pedidos, resolvido no servidor (mesmo cookie
 * `userData` do login): evita o salto de hidratação. Usado pela lista e pela
 * página de novo pedido — as duas precisam saber se a pessoa escolhe o vendedor.
 */
export async function resolveOrderSellerContext() {
  const userData = await getServerCookie<UserData>("userData");
  // Gestor filtra por vendedor e escolhe de quem é o pedido novo; o vendedor
  // não — a lista de vendedores é admin-only no backend.
  const isManager = MANAGER_ROLES.includes(userData?.role ?? "");
  const ownSellerId = await resolveOwnSellerId(userData ?? null);
  return { isManager, ownSellerId };
}
