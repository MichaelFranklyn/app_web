import { getCookie } from "@/utils/cookies/clientCookie";
import { getCurrentWeekMondayIso } from "@/utils/format/date";
import { useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  ROUTINE_SELLERS_QUERY,
  VISIT_SCHEDULE_CONFIG_QUERY,
  VISIT_SCHEDULES_QUERY,
} from "./gql";
import {
  RoutineCapacity,
  RoutineSellersQueryData,
  VisitSchedule,
  VisitScheduleConfigQueryData,
  VisitSchedulesQueryData,
} from "./interface";
import { shiftWeekIso } from "./utils";

// Papéis que enxergam a rotina de qualquer vendedor e podem escolher de quem ver.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

export type RoutineViewMode = "kanban" | "list" | "radar";
const VIEW_MODES: RoutineViewMode[] = ["kanban", "list", "radar"];

export function useRoutines() {
  const [weekStart, setWeekStart] = useState<string>(getCurrentWeekMondayIso);
  const [periodDays, setPeriodDays] = useState(7);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  // O vendedor escolhido vive na URL: ao sair da rotina (abrir um cliente, por
  // exemplo) e voltar, o gestor reencontra a rotina que estava vendo, em vez de
  // cair no primeiro vendedor da lista.
  const selectedSellerId = searchParams.get("sellerId");

  const setSelectedSellerId = useCallback(
    (id: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sellerId", id);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Modo de visualização (kanban/lista) também vive na URL: ao voltar para a
  // rotina, o usuário reencontra a visualização que estava usando. Kanban é o
  // padrão (a grade por dia).
  const viewParam = searchParams.get("view");
  const viewMode: RoutineViewMode = VIEW_MODES.includes(
    viewParam as RoutineViewMode
  )
    ? (viewParam as RoutineViewMode)
    : "kanban";

  const setViewMode = useCallback(
    (mode: RoutineViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", mode);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Default: primeiro vendedor da lista assim que ela carrega.
  useEffect(() => {
    if (canSelectSeller && !selectedSellerId && sellers.length > 0) {
      setSelectedSellerId(sellers[0].id);
    }
  }, [canSelectSeller, selectedSellerId, sellers, setSelectedSellerId]);

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

  const { data, loading, error, refetch } = useQuery<VisitSchedulesQueryData>(
    VISIT_SCHEDULES_QUERY,
    {
      variables: { input: { first: 1, filters } },
      skip: scheduleSkip,
      // O score dos cards (latestVisitScore) muda FORA desta página: registrar
      // estoque, concluir visita ou lançar pedido pelo cliente recalcula no
      // backend. Revalida em background a cada mount, mostrando o cache na
      // hora — o skeleton só aparece quando ainda não há dados.
      fetchPolicy: "cache-and-network",
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

  // Tetos diários por tipo. Os defaults espelham o backend para o caso de o
  // vendedor ainda não ter config (legado) — a rotina não pode ficar sem limite.
  const configNode = configQuery.data?.visit_schedule_configs.edges[0]?.node;
  const capacity: RoutineCapacity = useMemo(
    () => ({
      maxVisitsPerDay: configNode?.maxVisitsPerDay ?? 10,
      maxRemoteContactsPerDay: configNode?.maxRemoteContactsPerDay ?? 5,
      isRemoteContactEnabled: configNode?.isRemoteContactEnabled ?? true,
    }),
    [configNode]
  );

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
    viewMode,
    setViewMode,
    canSelectSeller,
    sellers,
    selectedSellerId,
    setSelectedSellerId,
    selectedSellerName,
    effectiveSellerId,
    capacity,
    schedule,
    showSkeleton,
    error: !scheduleSkip ? error : undefined,
    hasNoSellers,
    isCurrentWeek,
    handlePrevWeek,
    handleNextWeek,
    handleCurrentWeek,
    refetch,
  };
}
