"use client";

import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { useQuery } from "@apollo/client/react";
import { CalendarOff, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { RouteMapPlaceholder } from "./_components/RouteMapPlaceholder";
import { RouteStopsCard } from "./_components/RouteStopsCard";
import { RouteSummary } from "./_components/RouteSummary";
import { VisitsHeader } from "./_components/VisitsHeader";
import { VisitsSkeleton } from "./_components/VisitsSkeleton";
import { WEEK_SCHEDULE_QUERY } from "./gql";
import { VisitsWeekScheduleResponse } from "./interface";
import { formatDateLong, getWeekMondayIso, shiftDateIso } from "./utils";

interface Props {
  date: string;
  seller: string | null;
}

export default function DayRouteContent({ date, seller }: Props) {
  const weekStart = useMemo(() => getWeekMondayIso(date), [date]);

  const filters = useMemo(() => {
    const base = [{ field: "week_start", operator: "eq", value: weekStart }];
    if (seller) {
      base.push({ field: "seller_id", operator: "eq", value: seller });
    }
    return base;
  }, [weekStart, seller]);

  const { data, loading, refetch } = useQuery<VisitsWeekScheduleResponse>(
    WEEK_SCHEDULE_QUERY,
    { variables: { input: { first: 1, filters } } }
  );

  const schedule = data?.week_schedule.edges[0]?.node;
  const day = schedule?.days.find((d) => d.date === date);
  const sortedStops = useMemo(
    () =>
      day ? [...day.items].sort((a, b) => a.plannedOrder - b.plannedOrder) : [],
    [day]
  );

  const sellerQuery = seller ? `?seller=${seller}` : "";
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
            Não há um dia de rotina registrado para {formatDateLong(date)}. Use
            as setas para navegar entre os dias ou volte para a rotina semanal.
          </EmptyState.Description>
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

      <RouteSummary day={day} />

      <div className="flex gap-20">
        <div className="min-w-0 flex-1">
          <RouteMapPlaceholder
            stopsCount={sortedStops.length}
            distanceKm={day.routeDistanceKm}
          />
        </div>
        <div className="flex w-[320px] shrink-0 flex-col gap-12">
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
