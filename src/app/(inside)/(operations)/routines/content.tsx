"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { Title } from "@/components/Title";
import { getCookie } from "@/utils/cookies/clientCookie";
import { useQuery } from "@apollo/client/react";
import { CalendarOff, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RoutinesHeader } from "./_components/RoutinesHeader";
import { RoutinesSkeleton } from "./_components/RoutinesSkeleton";
import { RoutinesSummary } from "./_components/RoutinesSummary";
import { RoutinesWeekGrid } from "./_components/RoutinesWeekGrid";
import { ROUTINE_SELLERS_QUERY, VISIT_SCHEDULES_QUERY } from "./gql";
import {
  RoutineSellersQueryData,
  VisitSchedule,
  VisitSchedulesQueryData,
} from "./interface";
import {
  formatWeekRange,
  getCurrentWeekMondayIso,
  shiftWeekIso,
} from "./utils";

// Papéis que enxergam a rotina de qualquer vendedor e podem escolher de quem ver.
const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

// Quantos dias da rotina exibir (a partir de hoje); 7 = semana inteira.
const PERIOD_OPTIONS = [
  { label: "Hoje", value: 1 },
  { label: "3 dias", value: 3 },
  { label: "5 dias", value: 5 },
  { label: "Semana", value: 7 },
];

export default function RoutinesContent() {
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
    const base = [
      { field: "week_start", operator: "eq", value: weekStart },
    ];
    if (selectedSellerId) {
      base.push({ field: "seller_id", operator: "eq", value: selectedSellerId });
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

  // Gestor cujos vendedores ainda carregam, ou já carregaram mas sem nenhum.
  const sellersPending = canSelectSeller && sellersLoading;
  const hasNoSellers = canSelectSeller && !sellersLoading && sellers.length === 0;
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

  return (
    <PageContent>
      <RoutinesHeader
        weekStart={weekStart}
        seller={schedule?.seller ?? null}
        sellers={canSelectSeller ? sellers : undefined}
        selectedSellerId={selectedSellerId}
        selectedSellerName={selectedSellerName}
        onSelectSeller={setSelectedSellerId}
        onSelectDate={setWeekStart}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onCurrentWeek={handleCurrentWeek}
      />

      {showSkeleton ? (
        <RoutinesSkeleton />
      ) : hasNoSellers ? (
        <EmptyState.Root>
          <EmptyState.Icon>
            <Users />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhum vendedor cadastrado</EmptyState.Title>
          <EmptyState.Description>
            Cadastre um vendedor para gerar e acompanhar a rotina semanal de
            visitas.
          </EmptyState.Description>
        </EmptyState.Root>
      ) : !schedule ? (
        <EmptyState.Root>
          <EmptyState.Icon>
            <CalendarOff />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhuma rotina nesta semana</EmptyState.Title>
          <EmptyState.Description>
            Não há rotina cadastrada para {formatWeekRange(weekStart)}. Navegue
            entre as semanas ou volte para a semana atual.
          </EmptyState.Description>
          <EmptyState.Actions>
            <Button.Root
              appearance="tinted"
              color="amber"
              size="sm"
              noUppercase
              disabled={isCurrentWeek}
              onClick={handleCurrentWeek}
            >
              <Button.Title>
                {isCurrentWeek ? "Semana atual" : "Voltar para semana atual"}
              </Button.Title>
            </Button.Root>
          </EmptyState.Actions>
        </EmptyState.Root>
      ) : (
        <>
          <RoutinesSummary days={schedule.days} />

          <div className="flex flex-wrap items-center gap-8">
            <Title variant="body-xs" color="muted" weight="medium">
              Período:
            </Title>
            <div className="flex items-center gap-4">
              {PERIOD_OPTIONS.map((opt) => {
                const active = periodDays === opt.value;
                return (
                  <Button.Root
                    key={opt.value}
                    type="button"
                    appearance={active ? "tinted" : "outline"}
                    color={active ? "amber" : "neutral"}
                    size="sm"
                    noUppercase
                    onClick={() => setPeriodDays(opt.value)}
                  >
                    <Button.Title>{opt.label}</Button.Title>
                  </Button.Root>
                );
              })}
            </div>
          </div>

          <RoutinesWeekGrid
            weekStart={weekStart}
            days={schedule.days}
            sellerId={selectedSellerId}
            periodDays={periodDays}
            onChanged={() => refetch()}
          />
        </>
      )}
    </PageContent>
  );
}
