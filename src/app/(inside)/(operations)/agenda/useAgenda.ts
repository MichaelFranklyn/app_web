import { getCookie } from "@/utils/cookies/clientCookie";
import { getTodayIso } from "@/utils/format/date";
import { useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  indexDays,
  mondayOf,
  monthGrid,
  shiftAnchor,
  weekDates,
  weekStartsFor,
} from "./calendar";
import { AGENDA_PEOPLE_QUERY, VISIT_SCHEDULES_QUERY } from "./gql";
import {
  AgendaPeopleQueryData,
  AgendaPerson,
  AgendaView,
  VisitSchedule,
  VisitSchedulesQueryData,
} from "./interface";

// Papéis que abrem a agenda de qualquer pessoa da empresa.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];
const VIEWS: AgendaView[] = ["day", "week", "month"];

/**
 * A Agenda: de quem, qual período e em que visão (dia, semana, mês).
 *
 * Os três vivem na URL — ao abrir um cliente e voltar, o gestor reencontra a
 * agenda que estava vendo, no mesmo dia e na mesma visão. `?week=` continua
 * valendo (é por ele que o Montar semana devolve a pessoa à semana que montou).
 */
export function useAgenda() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const viewParam = searchParams.get("view") as AgendaView | null;
  const view: AgendaView =
    viewParam && VIEWS.includes(viewParam) ? viewParam : "week";
  const anchor =
    searchParams.get("date") ?? searchParams.get("week") ?? getTodayIso();

  const writeParams = useCallback(
    (patch: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      // A data passa a ser `date`: `week` só abre a tela — e a semana que ele
      // pediu continua sendo a âncora quando só a visão ou a pessoa muda.
      const week = params.get("week");
      if (week && !params.get("date")) params.set("date", week);
      params.delete("week");
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) params.delete(key);
        else params.set(key, value);
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  // Lido após o mount (cookie é client-only) para evitar mismatch de hidratação.
  const [canSelectPerson, setCanSelectPerson] = useState(false);
  useEffect(() => {
    const userData = getCookie<{ role?: string }>("userData");
    setCanSelectPerson(MANAGER_ROLES.includes(userData?.role ?? ""));
  }, []);

  const peopleQuery = useQuery<AgendaPeopleQueryData>(AGENDA_PEOPLE_QUERY, {
    variables: { input: { first: 200, order: { by: "name", dir: "asc" } } },
    skip: !canSelectPerson,
    // As pessoas se cadastram noutra tela.
    fetchPolicy: "cache-and-network",
  });

  // Quem vende primeiro (é quem tem rota), o escritório depois. Desativado não
  // tem agenda a abrir.
  const people = useMemo<AgendaPerson[]>(() => {
    const active = (peopleQuery.data?.agenda_people.edges ?? [])
      .map((edge) => edge.node)
      .filter((node) => node.isActive)
      .map((node) => ({
        id: node.id,
        name: node.name,
        sellerId: node.seller?.id ?? null,
      }));
    return [
      ...active.filter((person) => person.sellerId),
      ...active.filter((person) => !person.sellerId),
    ];
  }, [peopleQuery.data]);

  const personId = searchParams.get("of");
  const selectedPerson =
    people.find((person) => person.id === personId) ?? null;
  const setPersonId = useCallback(
    (id: string) => writeParams({ of: id }),
    [writeParams]
  );

  // Sem escolha, abre a agenda do primeiro vendedor — é a que o gestor mais
  // acompanha.
  useEffect(() => {
    if (canSelectPerson && !personId && people.length > 0) {
      setPersonId(people[0].id);
    }
  }, [canSelectPerson, personId, people, setPersonId]);

  const weekStarts = useMemo(() => weekStartsFor(view, anchor), [view, anchor]);
  const filters = useMemo(() => {
    const range = [
      { field: "week_start", operator: "gte", value: weekStarts[0] },
      { field: "week_start", operator: "lte", value: weekStarts.at(-1) },
    ];
    return personId
      ? [...range, { field: "owner_user_id", operator: "eq", value: personId }]
      : range;
  }, [weekStarts, personId]);

  // Gestor sem pessoa escolhida ainda não busca (a lista seria a da empresa).
  // Enquanto pulada, o `loading` dela não conta — senão a tela trava.
  const scheduleSkip = canSelectPerson && !personId;
  const { data, loading, error, refetch } = useQuery<VisitSchedulesQueryData>(
    VISIT_SCHEDULES_QUERY,
    {
      variables: { input: { first: weekStarts.length, filters } },
      skip: scheduleSkip,
      // O score dos cards muda FORA desta página (estoque, pedido): revalida
      // em segundo plano a cada visita, mostrando o cache na hora.
      fetchPolicy: "cache-and-network",
    }
  );

  const schedules = useMemo<VisitSchedule[]>(
    () => data?.visit_schedules?.edges.map((edge) => edge.node) ?? [],
    [data]
  );

  const weekStart = mondayOf(anchor);
  const dates = useMemo(
    () =>
      view === "month"
        ? monthGrid(anchor).flat()
        : view === "week"
          ? weekDates(weekStart)
          : [anchor],
    [view, anchor, weekStart]
  );
  const days = useMemo(() => indexDays(schedules, dates), [schedules, dates]);
  // A semana da âncora: é dela o resumo, a impressão e o link de resposta.
  const schedule = schedules.find(
    (s) => s.weekStart.slice(0, 10) === weekStart
  );

  // A rotina é de quem vende. O vendedor logado é sempre vendedor; para o
  // gestor, depende de quem ele abriu. A agenda do escritório tem só as
  // ligações combinadas — sem Montar semana nem folga.
  const sellerId = canSelectPerson
    ? (selectedPerson?.sellerId ?? null)
    : (schedules.find((s) => s.seller)?.seller?.id ?? null);
  const isSellerAgenda = canSelectPerson
    ? Boolean(selectedPerson?.sellerId)
    : true;

  const peoplePending =
    canSelectPerson && peopleQuery.loading && people.length === 0;
  const hasNoPeople =
    canSelectPerson && !peopleQuery.loading && people.length === 0;
  // Pessoas chegaram, mas o padrão ainda não foi escolhido (evita piscar).
  const awaitingPick = canSelectPerson && people.length > 0 && !personId;
  const showSkeleton =
    peoplePending || awaitingPick || (!scheduleSkip && loading && !data);

  const today = getTodayIso();
  const isShowingToday =
    view === "month"
      ? anchor.slice(0, 7) === today.slice(0, 7)
      : view === "week"
        ? weekStart === mondayOf(today)
        : anchor === today;

  return {
    view,
    anchor,
    weekStart,
    dates,
    days,
    schedule,
    canSelectPerson,
    people,
    personId,
    selectedPerson,
    setPersonId,
    sellerId,
    isSellerAgenda,
    showSkeleton,
    error: scheduleSkip ? undefined : error,
    hasNoPeople,
    isShowingToday,
    setView: (next: AgendaView) => writeParams({ view: next }),
    goPrev: () => writeParams({ date: shiftAnchor(view, anchor, -1) }),
    goNext: () => writeParams({ date: shiftAnchor(view, anchor, 1) }),
    goToday: () => writeParams({ date: today }),
    goToDate: (date: string) => writeParams({ date }),
    /** Abre um dia na visão de dia — o clique no número do dia, como no Google. */
    openDay: (date: string) => writeParams({ view: "day", date }),
    refetch,
  };
}
