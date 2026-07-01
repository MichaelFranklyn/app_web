import { getCookie } from "@/utils/cookies/clientCookie";
import { getCurrentWeekMondayIso } from "@/utils/format/date";
import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import {
  ROUTINE_SELLERS_QUERY,
  VISIT_SCHEDULE_CONFIG_QUERY,
  VISIT_SCHEDULES_QUERY,
} from "./gql";
import {
  RoutineSellersQueryData,
  VisitSchedule,
  VisitScheduleConfigQueryData,
  VisitSchedulesQueryData,
} from "./interface";
import { shiftWeekIso } from "./utils";

// Papéis que enxergam a rotina de qualquer vendedor e podem escolher de quem ver.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

export function useRoutines() {
  const [weekStart, setWeekStart] = useState<string>(getCurrentWeekMondayIso);
  const [periodDays, setPeriodDays] = useState(7);

  // Lido após o mount (cookie é client-only) para evitar mismatch de hidratação.
  const [canSelectSeller, setCanSelectSeller] = useState(false);
  useEffect(() => {
    const userData = getCookie<{ role?: string }>("userData");
    setCanSelectSeller(MANAGER_ROLES.includes(userData?.role ?? ""));
  }, []);

  const { data: sellersData, loading: sellersLoading } =
    useQuery<RoutineSellersQueryData>(ROUTINE_SELLERS_QUERY, {
      variables: { input: { first: 200 } },
      skip: !canSelectSeller,
    });

  const sellers = useMemo(
    () => sellersData?.routine_sellers.edges.map((e) => e.node) ?? [],
    [sellersData]
  );

  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null);

  // Default: primeiro vendedor da lista assim que ela carrega.
  useEffect(() => {
    if (canSelectSeller && !selectedSellerId && sellers.length > 0) {
      setSelectedSellerId(sellers[0].id);
    }
  }, [canSelectSeller, selectedSellerId, sellers]);

  const filters = useMemo(() => {
    const base = [{ field: "week_start", operator: "eq", value: weekStart }];
    if (selectedSellerId) {
      base.push({
        field: "seller_id",
        operator: "eq",
        value: selectedSellerId,
      });
    }
    return base;
  }, [weekStart, selectedSellerId]);

  // Manager sem vendedor escolhido ainda não busca a agenda (evita query sem
  // seller_id). Crucial: enquanto pulada, NÃO consideramos `loading` da query
  // de agenda — senão a tela trava em "carregando" para sempre.
  const scheduleSkip = canSelectSeller && !selectedSellerId;

  const { data, loading, refetch } = useQuery<VisitSchedulesQueryData>(
    VISIT_SCHEDULES_QUERY,
    {
      variables: { input: { first: 1, filters } },
      skip: scheduleSkip,
    }
  );

  const schedule: VisitSchedule | undefined = useMemo(
    () => data?.visit_schedules?.edges[0]?.node,
    [data]
  );

  // Vendedor efetivo: o escolhido pelo gestor ou o dono da rotina exibida
  // (vendedor logado não usa seletor). Usado para buscar o limite de visitas/dia.
  const effectiveSellerId = selectedSellerId ?? schedule?.seller?.id ?? null;

  const configQuery = useQuery<VisitScheduleConfigQueryData>(
    VISIT_SCHEDULE_CONFIG_QUERY,
    {
      variables: {
        input: {
          first: 1,
          filters: effectiveSellerId
            ? [{ field: "seller_id", operator: "eq", value: effectiveSellerId }]
            : [],
        },
      },
      skip: !effectiveSellerId,
    }
  );

  // Limite de visitas por dia (default 10, igual ao backend, quando sem config).
  const maxVisitsPerDay =
    configQuery.data?.visit_schedule_configs.edges[0]?.node.maxVisitsPerDay ??
    10;

  // Gestor cujos vendedores ainda carregam, ou já carregaram mas sem nenhum.
  const sellersPending = canSelectSeller && sellersLoading;
  const hasNoSellers =
    canSelectSeller && !sellersLoading && sellers.length === 0;
  // Vendedores chegaram, mas o default ainda não selecionou (evita flash).
  const awaitingSellerPick =
    canSelectSeller && sellers.length > 0 && !selectedSellerId;

  const showSkeleton =
    sellersPending ||
    awaitingSellerPick ||
    (!scheduleSkip && loading && !schedule);

  const selectedSellerName = useMemo(
    () => sellers.find((s) => s.id === selectedSellerId)?.name ?? null,
    [sellers, selectedSellerId]
  );

  const isCurrentWeek = weekStart === getCurrentWeekMondayIso();
  const handlePrevWeek = () => setWeekStart((cur) => shiftWeekIso(cur, -1));
  const handleNextWeek = () => setWeekStart((cur) => shiftWeekIso(cur, 1));
  const handleCurrentWeek = () => setWeekStart(getCurrentWeekMondayIso());

  return {
    weekStart,
    setWeekStart,
    periodDays,
    setPeriodDays,
    canSelectSeller,
    sellers,
    selectedSellerId,
    setSelectedSellerId,
    selectedSellerName,
    effectiveSellerId,
    maxVisitsPerDay,
    schedule,
    showSkeleton,
    hasNoSellers,
    isCurrentWeek,
    handlePrevWeek,
    handleNextWeek,
    handleCurrentWeek,
    refetch,
  };
}
