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

type DashboardData = Partial<
  OrdersByPeriodResponse &
    RecentOrdersResponse &
    CompanyClientsCountResponse &
    SchedulesByPeriodResponse
>;

/**
 * As quatro consultas do painel, para um recorte. Saem juntas; o que derruba
 * uma derruba o seed inteiro, e aí a tela busca do navegador como sempre fez
 * (backend fora, sessão caindo).
 */
const fetchDashboardData = async (
  range: ReturnType<typeof getCurrentWeekRangeIso>,
  sellerId: string | null,
  hasRoutines: boolean
): Promise<DashboardData> => {
  const variables = dashboardVariables(range, sellerId);
  try {
    return await executeServerQueries<DashboardData>({
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
    return {};
  }
};

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
 *
 * A fila sobrou uma vez: a lista de vendedores continuava vindo ANTES dos
 * números, porque é dela que sai o recorte. Como o vendedor default do gestor
 * que também vende já está no cookie `userData`, as duas saem juntas — e só
 * quando a aposta erra (perfil inativo, gestor que não vende) é que a segunda
 * espera pela primeira.
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
  const ownSellerId = userData?.sellerId ?? null;

  // A lista de vendedores sai JÁ, sem `await`: é dela que sai o recorte, mas
  // esperá-la antes de pedir os números somava uma segunda ida ao backend em
  // fila, e as duas juntas eram o tempo em branco antes do painel aparecer.
  const sellersPromise: Promise<DashboardSellersResponse | null> =
    canSelectSeller
      ? executeServerQueries<DashboardSellersResponse>({
          dashboard_sellers: {
            query: DASHBOARD_SELLERS_QUERY,
            variables: SELLERS_VARIABLES,
          },
        }).catch(() => null)
      : Promise.resolve(null);

  // A aposta: o gestor que também vende abre vendo "os meus", e esse id já veio
  // no cookie — dá para pedir os números ao mesmo tempo que a lista. Quem não
  // escolhe vendedor (o próprio vendedor) não tem recorte nenhum e também pode
  // pedir de imediato.
  const optimisticSellerId = canSelectSeller ? ownSellerId : null;
  const canFetchNow = !canSelectSeller || Boolean(optimisticSellerId);
  const optimisticData = canFetchNow
    ? fetchDashboardData(range, optimisticSellerId, hasRoutines)
    : null;

  const sellers = await sellersPromise;

  // Default: o próprio perfil do gestor quando ele também é vendedor (abre
  // vendo "os meus"), senão o primeiro da lista.
  const sellerIds =
    sellers?.dashboard_sellers?.edges.map(({ node }) => node.id) ?? [];
  const initialSellerId = canSelectSeller
    ? ((ownSellerId && sellerIds.includes(ownSellerId)
        ? ownSellerId
        : sellerIds[0]) ?? null)
    : null;

  // Gestor cuja lista de vendedores não veio (ou empresa sem nenhum) fica sem
  // recorte: buscar sem escopo traria a empresa inteira, que não é o que a tela
  // mostra. O cliente resolve quando a lista chegar.
  const canSeed = !canSelectSeller || Boolean(initialSellerId);

  let data: DashboardData = {};
  if (optimisticData && initialSellerId === optimisticSellerId) {
    // Aposta certa: os números já estavam voltando.
    data = await optimisticData;
  } else if (canSeed) {
    // Aposta errada (perfil de vendedor do gestor inativo, por exemplo) ou
    // gestor que não vende: aí não teve jeito, vai em fila mesmo.
    data = await fetchDashboardData(range, initialSellerId, hasRoutines);
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
