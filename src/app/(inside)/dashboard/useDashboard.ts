import { getCookie } from "@/utils/cookies/clientCookie";
import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import {
  COMPANY_CLIENTS_COUNT_QUERY,
  DASHBOARD_SELLERS_QUERY,
  ORDERS_BY_PERIOD_QUERY,
  SCHEDULES_BY_PERIOD_QUERY,
} from "./gql";
import {
  CompanyClientsCountResponse,
  DashboardSellersResponse,
  DateRangeIso,
  OrdersByPeriodResponse,
  SchedulesByPeriodResponse,
  SellerOption,
} from "./interface";
import { getCurrentWeekRangeIso } from "./utils";

// Papéis que enxergam os dados de qualquer vendedor e escolhem de quem ver.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

// Anexa o filtro de vendedor às buscas do dashboard quando um gestor escolhe
// alguém no seletor. Vendedor logado é escopado pelo backend (token), não aqui.
const withSeller = (
  filters: { field: string; operator: string; value: string }[],
  sellerId: string | null
) =>
  sellerId
    ? [...filters, { field: "seller_id", operator: "eq", value: sellerId }]
    : filters;

export function useDashboard() {
  const initialRange = useMemo(getCurrentWeekRangeIso, []);
  const [range, setRange] = useState<DateRangeIso>(initialRange);

  // Lido após o mount (cookie é client-only) para evitar mismatch de hidratação.
  const [canSelectSeller, setCanSelectSeller] = useState(false);
  useEffect(() => {
    const userData = getCookie<{ role?: string }>("userData");
    setCanSelectSeller(MANAGER_ROLES.includes(userData?.role ?? ""));
  }, []);

  const sellersQuery = useQuery<DashboardSellersResponse>(
    DASHBOARD_SELLERS_QUERY,
    { variables: { input: { first: 200 } }, skip: !canSelectSeller }
  );

  const sellers: SellerOption[] = useMemo(
    () => sellersQuery.data?.dashboard_sellers.edges.map((e) => e.node) ?? [],
    [sellersQuery.data]
  );

  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // Default: primeiro vendedor da lista assim que ela carrega.
  useEffect(() => {
    if (canSelectSeller && !selectedSellerId && sellers.length > 0) {
      setSelectedSellerId(sellers[0].id);
    }
  }, [canSelectSeller, selectedSellerId, sellers]);

  const selectedSellerName = useMemo(
    () => sellers.find((s) => s.id === selectedSellerId)?.name ?? null,
    [sellers, selectedSellerId]
  );

  // Gestor sem vendedor escolhido ainda não busca os dados (evita query sem
  // escopo). Enquanto pulada, as queries não contam como `loading`.
  const dataSkip = canSelectSeller && !selectedSellerId;

  const ordersByPeriod = useQuery<OrdersByPeriodResponse>(
    ORDERS_BY_PERIOD_QUERY,
    {
      variables: {
        input: {
          first: 100,
          filters: withSeller(
            [
              { field: "order_date", operator: "gte", value: range.from },
              { field: "order_date", operator: "lte", value: range.to },
            ],
            selectedSellerId
          ),
          order: { by: "created_at", dir: "desc" },
        },
      },
      skip: dataSkip,
    }
  );

  const clientsCount = useQuery<CompanyClientsCountResponse>(
    COMPANY_CLIENTS_COUNT_QUERY,
    {
      variables: {
        input: { first: 1, filters: withSeller([], selectedSellerId) },
      },
      skip: dataSkip,
    }
  );

  const schedulesByPeriod = useQuery<SchedulesByPeriodResponse>(
    SCHEDULES_BY_PERIOD_QUERY,
    {
      variables: {
        input: {
          first: 20,
          filters: withSeller(
            [
              { field: "week_start", operator: "gte", value: range.from },
              { field: "week_start", operator: "lte", value: range.to },
            ],
            selectedSellerId
          ),
        },
      },
      skip: dataSkip,
    }
  );

  const orders =
    ordersByPeriod.data?.orders_by_period.edges.map((e) => e.node) ?? [];
  const totalOrders = ordersByPeriod.data?.orders_by_period.totalCount ?? 0;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  const totalClients = clientsCount.data?.company_clients_count.totalCount ?? 0;

  const schedules =
    schedulesByPeriod.data?.schedules_by_period.edges.map((e) => e.node) ?? [];
  const allItems = schedules.flatMap((s) => s.days.flatMap((d) => d.items));
  const completedVisits = allItems.filter(
    (i) => i.status === "COMPLETED"
  ).length;
  const totalPlannedVisits = allItems.length;
  const upcomingVisits = allItems
    .filter((i) => i.status === "PENDING")
    .slice(0, 5);

  // Gestor cujos vendedores ainda carregam, ou já carregaram mas sem nenhum.
  const sellersPending = canSelectSeller && sellersQuery.loading;
  // Vendedores chegaram, mas o default ainda não selecionou (evita flash).
  const awaitingSellerPick =
    canSelectSeller && sellers.length > 0 && !selectedSellerId;

  const isLoading =
    sellersPending ||
    awaitingSellerPick ||
    (!dataSkip &&
      (ordersByPeriod.loading ||
        clientsCount.loading ||
        schedulesByPeriod.loading));

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
    isLoading,
  };
}
