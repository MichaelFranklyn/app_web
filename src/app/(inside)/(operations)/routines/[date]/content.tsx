"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  CalendarOff,
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { useUserRole } from "@/services/flowTour/useUserRole";
import { RouteMap } from "./_components/RouteMap";
import { RouteStopsCard } from "./_components/RouteStopsCard";
import { RouteSummary } from "./_components/RouteSummary";
import { VisitsHeader } from "./_components/VisitsHeader";
import { VisitsSkeleton } from "./_components/VisitsSkeleton";
import { GENERATE_DAY_ROUTE_MUTATION } from "../gql";
import { WEEK_SCHEDULE_QUERY } from "./gql";
import { VisitsWeekScheduleResponse } from "./interface";

interface GenerateDayRouteResponse {
  generateDayRoute?: {
    status: boolean;
    message: string;
    data?: { id: string } | null;
  };
}
import { formatDateLong, getWeekMondayIso, shiftDateIso } from "./utils";

interface Props {
  date: string;
  /** Vendedor escolhido (gestor vindo da grade). Ausente = rotina do logado. */
  sellerId?: string | null;
}

export default function DayRouteContent({ date, sellerId }: Props) {
  const weekStart = useMemo(() => getWeekMondayIso(date), [date]);

  // Só o vendedor gera a própria rota; owner/admin apenas visualizam.
  const canGenerate = useUserRole() === "SELLER";

  // Sem vendedor explícito, mostra a rotina do próprio logado (sentinela "me",
  // que o backend escopa ao usuário em qualquer papel). Quando o gestor chega
  // pela grade com ?seller=<id>, busca a rotina daquele vendedor.
  const scopedSeller = sellerId ?? "me";
  const filters = useMemo(
    () => [
      { field: "week_start", operator: "eq", value: weekStart },
      { field: "seller_id", operator: "eq", value: scopedSeller },
    ],
    [weekStart, scopedSeller]
  );

  const { data, loading, refetch } = useQuery<VisitsWeekScheduleResponse>(
    WEEK_SCHEDULE_QUERY,
    { variables: { input: { first: 1, filters } } }
  );

  const [generateDayRoute] = useMutation<GenerateDayRouteResponse>(
    GENERATE_DAY_ROUTE_MUTATION
  );
  const { execute: generateRoute, isLoading: isGenerating } = useAsyncAction();

  // Gera a rota do dia quando ele ainda não tem rota planejada. Sem sellerId: o
  // backend resolve para o próprio usuário logado (mesma regra do escopo "me").
  const handleGenerateDay = () =>
    generateRoute(
      async () => {
        const res = await generateDayRoute({
          variables: { input: { date } },
        });
        const payload = res.data?.generateDayRoute;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao gerar a rota do dia");
        }
        return payload;
      },
      {
        successMessage: "Rota do dia gerada",
        onSuccess: () => refetch(),
      }
    );

  const schedule = data?.week_schedule.edges[0]?.node;
  const day = schedule?.days.find((d) => d.date === date);
  const sortedStops = useMemo(
    () =>
      day ? [...day.items].sort((a, b) => a.plannedOrder - b.plannedOrder) : [],
    [day]
  );

  // Mantém o vendedor escolhido ao navegar entre os dias (gestor).
  const sellerQuery = sellerId ? `?seller=${sellerId}` : "";
  const prevHref = `/routines/${shiftDateIso(date, -1)}${sellerQuery}`;
  const nextHref = `/routines/${shiftDateIso(date, 1)}${sellerQuery}`;

  const controls = (
    <div className="flex items-center justify-between">
      <Link
        href="/routines"
        className="inline-flex items-center gap-4 text-[13px] text-(--muted) transition-colors hover:text-(--text)"
      >
        <ChevronLeft size={14} />
        Voltar para a rotina
      </Link>
      <div className="flex items-center gap-8">
        <Link
          href={prevHref}
          aria-label="Dia anterior"
          className="inline-flex items-center justify-center rounded-(--r-md) border border-(--border) p-[7px] text-(--muted) transition-colors hover:border-(--border2) hover:text-(--text)"
        >
          <ChevronLeft size={16} />
        </Link>
        <Link
          href={nextHref}
          aria-label="Próximo dia"
          className="inline-flex items-center justify-center rounded-(--r-md) border border-(--border) p-[7px] text-(--muted) transition-colors hover:border-(--border2) hover:text-(--text)"
        >
          <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );

  if (loading && !schedule) {
    return <VisitsSkeleton />;
  }

  if (!day) {
    return (
      <PageContent>
        {controls}
        <VisitsHeader
          dateLabel={formatDateLong(date)}
          sellerName={schedule?.seller?.user?.name ?? null}
        />
        <EmptyState.Root>
          <EmptyState.Icon>
            <CalendarOff />
          </EmptyState.Icon>
          <EmptyState.Title>Sem rota planejada para este dia</EmptyState.Title>
          <EmptyState.Description>
            Não há um dia de rotina registrado para {formatDateLong(date)}.{" "}
            {canGenerate
              ? "Gere uma rota para este dia, use as setas para navegar entre os dias ou volte para a rotina semanal."
              : "Use as setas para navegar entre os dias ou volte para a rotina semanal."}
          </EmptyState.Description>
          {canGenerate && (
            <EmptyState.Actions>
              <Button.Root
                appearance="solid"
                color="amber"
                size="md"
                noUppercase
                loading={isGenerating}
                onClick={handleGenerateDay}
              >
                <Button.Icon icon={CalendarPlus} />
                <Button.Title>Gerar rota para este dia</Button.Title>
              </Button.Root>
            </EmptyState.Actions>
          )}
        </EmptyState.Root>
      </PageContent>
    );
  }

  return (
    <PageContent>
      {controls}
      <VisitsHeader
        dateLabel={formatDateLong(day.date)}
        sellerName={schedule?.seller?.user?.name ?? null}
      />

      <div data-tour="routine-day-summary">
        <RouteSummary day={day} />
      </div>

      <div className="desktop:flex-row flex flex-col gap-20">
        <div className="min-w-0 flex-1">
          <RouteMap
            stops={sortedStops}
            distanceKm={day.routeDistanceKm}
            departureAddress={day.departureAddress}
          />
        </div>
        <div
          className="desktop:w-[320px] flex w-full shrink-0 flex-col gap-12"
          data-tour="routine-day-stops"
        >
          <RouteStopsCard
            stops={sortedStops}
            currentDayId={day.id}
            scheduleDays={schedule?.days ?? []}
            onChanged={() => refetch()}
          />
        </div>
      </div>
    </PageContent>
  );
}
