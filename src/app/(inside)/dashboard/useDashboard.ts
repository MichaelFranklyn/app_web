import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useFeature } from "@/services/plan";
import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

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
  DateRangeIso,
  OrdersByPeriodResponse,
  RecentOrdersResponse,
  SchedulesByPeriodResponse,
  SellerOption,
} from "./interface";
import { dashboardVariables, SELLERS_VARIABLES } from "./utils";

interface UseDashboardParams {
  canSelectSeller: boolean;
  ownSellerId?: string | null;
  initialRange: DateRangeIso;
  initialSellerId: string | null;
  seed: DashboardSeed | null;
}

// `canSelectSeller`, a semana e o vendedor default são resolvidos no servidor
// (page.tsx) e entram por parâmetro — sem salto extra de hidratação e, mais
// importante, sem esperar a lista de vendedores para saber o que perguntar.
export function useDashboard({
  canSelectSeller,
  ownSellerId,
  initialRange,
  initialSellerId,
  seed,
}: UseDashboardParams) {
  // As variáveis do que o SERVIDOR buscou. O seed casa por variável, então
  // estas têm de ser as mesmas que o `useQuery` do primeiro render vai pedir.
  const seedVariables = dashboardVariables(initialRange, initialSellerId);

  // Antes de qualquer `useQuery`: com o cache já quente, o `cache-first` do
  // primeiro render acerta e a tela pinta sem ida à rede.
  useSeedQuery([
    {
      query: DASHBOARD_SELLERS_QUERY,
      variables: SELLERS_VARIABLES,
      data: seed?.sellers,
    },
    {
      query: ORDERS_BY_PERIOD_QUERY,
      variables: seedVariables.orders,
      data: seed?.orders,
    },
    {
      query: RECENT_ORDERS_QUERY,
      variables: seedVariables.recentOrders,
      data: seed?.recentOrders,
    },
    {
      query: COMPANY_CLIENTS_COUNT_QUERY,
      variables: seedVariables.clientsCount,
      data: seed?.clients,
    },
    {
      query: SCHEDULES_BY_PERIOD_QUERY,
      variables: seedVariables.schedules,
      data: seed?.schedules,
    },
  ]);

  const [range, setRange] = useState<DateRangeIso>(initialRange);
  const hasRoutines = useFeature("ROUTINES");

  const sellersQuery = useQuery<DashboardSellersResponse>(
    DASHBOARD_SELLERS_QUERY,
    {
      variables: SELLERS_VARIABLES,
      skip: !canSelectSeller,
      fetchPolicy: "cache-and-network",
    }
  );

  const sellers: SellerOption[] = useMemo(
    () => sellersQuery.data?.dashboard_sellers?.edges.map((e) => e.node) ?? [],
    [sellersQuery.data]
  );

  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(
    initialSellerId
  );

  // Rede de segurança para quando o servidor não conseguiu escolher (lista não
  // veio no SSR): mesma regra dele — o próprio perfil, senão o primeiro.
  useEffect(() => {
    if (canSelectSeller && !selectedSellerId && sellers.length > 0) {
      const own = ownSellerId && sellers.find((s) => s.id === ownSellerId);
      setSelectedSellerId(own ? own.id : sellers[0].id);
    }
  }, [canSelectSeller, selectedSellerId, sellers, ownSellerId]);

  const selectedSellerName = useMemo(
    () => sellers.find((s) => s.id === selectedSellerId)?.name ?? null,
    [sellers, selectedSellerId]
  );

  // Gestor sem vendedor escolhido ainda não busca os dados (evita query sem
  // escopo). Enquanto pulada, as queries não contam como `loading`.
  const dataSkip = canSelectSeller && !selectedSellerId;
  const variables = useMemo(
    () => dashboardVariables(range, selectedSellerId),
    [range, selectedSellerId]
  );

  // `cache-and-network` nas quatro: o seed do SSR pinta o painel no primeiro
  // render e a revalidação acontece por baixo. Com o `cache-first` implícito, um
  // cache quente (a volta de uma navegação) devolveria os números da visita
  // anterior e nem tentaria buscar os novos — quem acabou de lançar um pedido
  // voltaria ao painel e não o veria.
  const ordersByPeriod = useQuery<OrdersByPeriodResponse>(
    ORDERS_BY_PERIOD_QUERY,
    {
      variables: variables.orders,
      skip: dataSkip,
      fetchPolicy: "cache-and-network",
    }
  );

  const recentOrders = useQuery<RecentOrdersResponse>(RECENT_ORDERS_QUERY, {
    variables: variables.recentOrders,
    skip: dataSkip,
    fetchPolicy: "cache-and-network",
  });

  const clientsCount = useQuery<CompanyClientsCountResponse>(
    COMPANY_CLIENTS_COUNT_QUERY,
    {
      variables: variables.clientsCount,
      skip: dataSkip,
      fetchPolicy: "cache-and-network",
    }
  );

  const schedulesByPeriod = useQuery<SchedulesByPeriodResponse>(
    SCHEDULES_BY_PERIOD_QUERY,
    {
      variables: variables.schedules,
      // Sem o motor de rotina no plano, o backend recusa `visitSchedules` — e a
      // recusa derrubaria o dashboard inteiro por causa de um cartão. Quem não
      // contratou não pergunta.
      skip: dataSkip || !hasRoutines,
      fetchPolicy: "cache-and-network",
    }
  );

  // A lista que aparece e a que soma são consultas diferentes: a de baixo traz
  // cliente e fábrica das quatro linhas visíveis; esta traz só o valor de cem.
  const orders =
    recentOrders.data?.recent_orders?.edges.map((e) => e.node) ?? [];
  const totalOrders = ordersByPeriod.data?.orders_by_period.totalCount ?? 0;
  const totalRevenue = (
    ordersByPeriod.data?.orders_by_period?.edges ?? []
  ).reduce((sum, { node }) => sum + Number(node.totalAmount || 0), 0);

  const totalClients = clientsCount.data?.company_clients_count.totalCount ?? 0;

  const schedules =
    schedulesByPeriod.data?.schedules_by_period?.edges.map((e) => e.node) ?? [];
  const allItems = schedules.flatMap((s) => s.days.flatMap((d) => d.items));
  const completedVisits = allItems.filter(
    (i) => i.status === "COMPLETED"
  ).length;
  const totalPlannedVisits = allItems.length;
  const upcomingVisits = allItems
    .filter((i) => i.status === "PENDING")
    .slice(0, 5);

  // Só é "carregando" o que ainda não tem NADA para mostrar. Com o cache
  // semeado pelo SSR o `cache-and-network` continua revalidando por baixo, e
  // olhar só o `loading` do Apollo trocaria a tela pronta por um esqueleto —
  // justamente o contrário do que o seed foi buscar.
  const sellersPending =
    canSelectSeller && sellersQuery.loading && sellers.length === 0;
  // Vendedores chegaram, mas o default ainda não selecionou (evita flash).
  const awaitingSellerPick =
    canSelectSeller && sellers.length > 0 && !selectedSellerId;

  const isLoading =
    sellersPending ||
    awaitingSellerPick ||
    (!dataSkip &&
      ((ordersByPeriod.loading && !ordersByPeriod.data) ||
        (recentOrders.loading && !recentOrders.data) ||
        (clientsCount.loading && !clientsCount.data) ||
        (schedulesByPeriod.loading && !schedulesByPeriod.data)));

  // Qualquer uma das buscas do painel que falhe marca o dashboard como em erro.
  const error =
    sellersQuery.error ??
    (!dataSkip
      ? (ordersByPeriod.error ??
        recentOrders.error ??
        clientsCount.error ??
        schedulesByPeriod.error)
      : undefined);

  const refetch = () => {
    if (canSelectSeller) sellersQuery.refetch();
    if (!dataSkip) {
      ordersByPeriod.refetch();
      recentOrders.refetch();
      clientsCount.refetch();
      if (hasRoutines) schedulesByPeriod.refetch();
    }
  };

  return {
    range,
    setRange,
    canSelectSeller,
    sellers,
    selectedSellerId,
    setSelectedSellerId,
    selectedSellerName,
    orders,
    totalOrders,
    totalRevenue,
    totalClients,
    completedVisits,
    totalPlannedVisits,
    upcomingVisits,
    // A tela usa para esconder os cartões de visita — sem o motor de rotina não
    // há o que mostrar, e um "0 visitas" pareceria um dia vazio, não um recurso
    // ausente.
    hasRoutines,
    isLoading,
    error,
    refetch,
  };
}
