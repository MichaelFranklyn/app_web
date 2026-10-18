import { getCookie } from "@/utils/cookies/clientCookie";
import { useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ROUTINE_SELLERS_QUERY } from "../gql";
import { RoutineSellersQueryData } from "../interface";
import { PRIORITY_CLIENTS_QUERY } from "./gql";
import { PriorityClientsData, PriorityScope } from "./interface";
import { defaultPlanWeek, groupByRegion } from "./utils";
import { useWeekSelection } from "./useWeekSelection";

// Os mesmos papéis que escolhem de quem é a rotina na tela da semana.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

/**
 * O estado da tela "Montar semana": de quem, qual semana, a lista de
 * prioritários e o que o vendedor já escolheu.
 *
 * Vendedor e semana vivem na URL (`?sellerId=&week=`): é por ela que a tela da
 * semana abre esta, e é para lá que a pessoa volta depois de gravar.
 */
export function usePlanWeek() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [canSelectSeller, setCanSelectSeller] = useState(false);
  useEffect(() => {
    const userData = getCookie<{ role?: string }>("userData");
    setCanSelectSeller(MANAGER_ROLES.includes(userData?.role ?? ""));
  }, []);

  const { data: sellersData } = useQuery<RoutineSellersQueryData>(
    ROUTINE_SELLERS_QUERY,
    { variables: { input: { first: 200 } }, skip: !canSelectSeller }
  );
  const sellers = useMemo(
    () => sellersData?.routine_sellers.edges.map((e) => e.node) ?? [],
    [sellersData]
  );

  const sellerId = searchParams.get("sellerId");
  const weekStart = searchParams.get("week") ?? defaultPlanWeek();

  const setParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    if (canSelectSeller && !sellerId && sellers.length > 0) {
      setParam("sellerId", sellers[0].id);
    }
  }, [canSelectSeller, sellerId, sellers, setParam]);

  const skip = canSelectSeller && !sellerId;
  const { data, loading, error, refetch } = useQuery<PriorityClientsData>(
    PRIORITY_CLIENTS_QUERY,
    {
      variables: { weekStart, sellerId },
      skip,
      // O score muda fora daqui (pedido, estoque, visita registrada).
      fetchPolicy: "cache-and-network",
    }
  );
  const result = data?.priority_clients ?? null;

  const week = useWeekSelection(`${sellerId ?? "me"}|${weekStart}`);

  const [scope, setScope] = useState<PriorityScope>("priority");
  const [search, setSearch] = useState("");
  const groups = useMemo(
    () => groupByRegion(result?.clients ?? [], scope, search, week.selection),
    [result, scope, search, week.selection]
  );

  return {
    canSelectSeller,
    sellers,
    sellerId,
    setSellerId: (id: string) => setParam("sellerId", id),
    weekStart,
    setWeekStart: (iso: string) => setParam("week", iso),
    result,
    groups,
    loading: skip || (loading && !result),
    error,
    refetch,
    ...week,
    scope,
    setScope,
    search,
    setSearch,
  };
}
