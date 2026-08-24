import { UserData } from "@/app/(auth)/login/interface";
import { executeServerQueries } from "@/services/graphql/getDataServer";
import { hasFeatureServer } from "@/services/plan/server";
import { getServerCookie } from "@/utils/cookies/serverCookie";
import DashboardContent from "./content";
import {
  COMPANY_CLIENTS_COUNT_QUERY,
  DASHBOARD_SELLERS_QUERY,
  ORDERS_BY_PERIOD_QUERY,
  RECENT_ORDERS_QUERY,
  SCHEDULES_BY_PERIOD_QUERY,
} from "./gql";
import {
  CompanyClientsCountResponse,
  DashboardSeed,
  DashboardSellersResponse,
  OrdersByPeriodResponse,
  RecentOrdersResponse,
  SchedulesByPeriodResponse,
} from "./interface";
import {
  dashboardVariables,
  getCurrentWeekRangeIso,
  SELLERS_VARIABLES,
} from "./utils";

// Papéis que enxergam os dados de qualquer vendedor e escolhem de quem ver.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

/**
 * A tela mais aberta do sistema, buscada no SERVIDOR.
 *
 * Antes tudo saía do navegador, e em FILA: baixar o JS da rota → pedir os
 * vendedores → escolher um → só então pedir pedidos, clientes e visitas. Eram
 * duas idas à rede pública em sequência antes do primeiro número aparecer, com
 * o esqueleto ocupando a tela inteira nesse meio-tempo — e é essa espera que o
 * Speed Insights mede como carregamento.
 *
 * Aqui as mesmas consultas saem do servidor, que fala com o backend por uma
 * rede curta, e chegam prontas no HTML. O `loading.tsx` ao lado é o que segura
 * essa espera: sem ele o navegador não receberia nada enquanto isso acontece.
 */
const Page = async () => {
  // Papel resolvido no servidor, a partir do mesmo cookie `userData` gravado no
  // login: evita o salto de hidratação (mount → ler cookie → setState → 1ª
  // query) na tela mais usada, sem depender de o JWT carregar o claim `role`.
  const userData = await getServerCookie<UserData>("userData");
  const canSelectSeller = MANAGER_ROLES.includes(userData?.role ?? "");
  // Sem o motor de rotina no plano o backend recusa `visitSchedules`, e uma
  // recusa aqui derrubaria a página inteira por causa de um cartão.
  const hasRoutines = await hasFeatureServer("ROUTINES");
  const range = getCurrentWeekRangeIso();

  // Os vendedores vêm primeiro porque é deles que sai o recorte de tudo o mais:
  // é esta consulta que estava presa atrás do JS do navegador.
  let sellers: DashboardSellersResponse | null = null;
  if (canSelectSeller) {
    try {
      sellers = await executeServerQueries<DashboardSellersResponse>({
        dashboard_sellers: {
          query: DASHBOARD_SELLERS_QUERY,
          variables: SELLERS_VARIABLES,
        },
      });
    } catch {
      sellers = null;
    }
  }

  // Default: o próprio perfil do gestor quando ele também é vendedor (abre
  // vendo "os meus"), senão o primeiro da lista. Mesma regra de antes — só que
  // decidida aqui, e não depois de um round-trip.
  const sellerIds =
    sellers?.dashboard_sellers?.edges.map(({ node }) => node.id) ?? [];
  const initialSellerId = canSelectSeller
    ? ((userData?.sellerId && sellerIds.includes(userData.sellerId)
        ? userData.sellerId
        : sellerIds[0]) ?? null)
    : null;

  // Gestor cuja lista de vendedores não veio (ou empresa sem nenhum) fica sem
  // recorte: buscar sem escopo traria a empresa inteira, que não é o que a tela
  // mostra. O cliente resolve quando a lista chegar.
  const canSeed = !canSelectSeller || Boolean(initialSellerId);
  const variables = dashboardVariables(range, initialSellerId);

  let data: Partial<
    OrdersByPeriodResponse &
      RecentOrdersResponse &
      CompanyClientsCountResponse &
      SchedulesByPeriodResponse
  > = {};
  if (canSeed) {
    try {
      data = await executeServerQueries({
        orders_by_period: {
          query: ORDERS_BY_PERIOD_QUERY,
          variables: variables.orders,
        },
        recent_orders: {
          query: RECENT_ORDERS_QUERY,
          variables: variables.recentOrders,
        },
        company_clients_count: {
          query: COMPANY_CLIENTS_COUNT_QUERY,
          variables: variables.clientsCount,
        },
        ...(hasRoutines && {
          schedules_by_period: {
            query: SCHEDULES_BY_PERIOD_QUERY,
            variables: variables.schedules,
          },
        }),
      });
    } catch {
      // Backend fora, sessão caindo: a tela busca do navegador como sempre fez.
      data = {};
    }
  }

  const seed: DashboardSeed = {
    sellers,
    orders: data.orders_by_period
      ? { orders_by_period: data.orders_by_period }
      : null,
    recentOrders: data.recent_orders
      ? { recent_orders: data.recent_orders }
      : null,
    clients: data.company_clients_count
      ? { company_clients_count: data.company_clients_count }
      : null,
    schedules: data.schedules_by_period
      ? { schedules_by_period: data.schedules_by_period }
      : null,
  };

  return (
    <DashboardContent
      canSelectSeller={canSelectSeller}
      ownSellerId={userData?.sellerId ?? null}
      initialRange={range}
      initialSellerId={initialSellerId}
      seed={seed}
    />
  );
};

export default Page;
