import type { UserData } from "@/app/(auth)/login/interface";
import { getCookie } from "@/utils/cookies/clientCookie";
import { useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ROUTINE_SELLERS_QUERY } from "../gql";
import { RoutineSellersQueryData } from "../interface";
import { PRIORITY_CLIENTS_QUERY } from "./gql";
import { PriorityClientsData, PriorityScope } from "./interface";
import {
  ALL_CITIES,
  defaultPlanWeek,
  filterByCity,
  groupByRegion,
} from "./utils";
import { useWeekSelection } from "./useWeekSelection";

// Os mesmos papéis que escolhem de quem é a rotina na tela da semana.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

/**
 * O estado da tela "Montar semana": de quem, qual semana, a lista de
 * prioritários e o que o vendedor já escolheu.
 *
 * Vendedor e semana vêm da URL (`?sellerId=&week=`): é por ela que a Agenda
 * abre esta, e é para lá que a pessoa volta depois de gravar.
 */
export function usePlanWeek() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Null = o cookie ainda não foi lido (só no effect, no cliente). Enquanto
  // isso não se busca nada: tratado como "não gestor", o primeiro render
  // disparava as queries com sellerId nulo e o gestor via o toast de erro
  // ("Escolha o vendedor da agenda.") antes do redirect para ?sellerId=.
  const [role, setRole] = useState<"manager" | "seller" | null>(null);
  const canSelectSeller = role === "manager";
  // O perfil de vendedor de quem está logado: é a agenda do vendedor quando a
  // URL não diz de quem (o "Marcar visita" precisa saber a carteira).
  const [ownSellerId, setOwnSellerId] = useState<string | null>(null);
  useEffect(() => {
    const userData = getCookie<UserData>("userData");
    setRole(
      MANAGER_ROLES.includes(userData?.role ?? "") ? "manager" : "seller"
    );
    setOwnSellerId(userData?.sellerId ?? null);
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
  // A lista não navega por semana (a semana se escolhe na configuração). Esta
  // é a semana da LEITURA — o que já está marcado e quem pediu para esperar — e
  // a que a configuração abre sugerindo; `?week=` vem da Agenda.
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

  const skip = role === null || (canSelectSeller && !sellerId);
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

  const week = useWeekSelection(sellerId ?? "me");

  const [scope, setScope] = useState<PriorityScope>("priority");
  const [search, setSearch] = useState("");
  const groups = useMemo(
    () => groupByRegion(result?.clients ?? [], scope, search, week.selection),
    [result, scope, search, week.selection]
  );
  // A cidade filtra só a lista: os escolhidos de outras cidades seguem no
  // painel "Sua semana".
  const [city, setCity] = useState(ALL_CITIES);
  const shown = useMemo(() => filterByCity(groups, city), [groups, city]);

  return {
    canSelectSeller,
    sellers,
    sellerId,
    /** O vendedor da agenda em tela: o escolhido, ou o próprio logado. */
    effectiveSellerId: sellerId ?? ownSellerId,
    setSellerId: (id: string) => setParam("sellerId", id),
    weekStart,
    result,
    /** Todas as cidades da lista (as opções do filtro). */
    groups,
    /** As cidades em tela, depois do filtro de cidade. */
    shownGroups: shown.groups,
    city: shown.city,
    setCity,
    /** Gestor ainda sem vendedor na URL (o redirect está a caminho): nada a buscar. */
    awaitingSeller: skip,
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
