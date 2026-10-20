"use client";

import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { getTodayIso } from "@/utils/format/date";
import { Users } from "lucide-react";

import { AgendaDayView } from "./_components/AgendaDayView";
import { AgendaMonthView } from "./_components/AgendaMonthView";
import { AgendaToolbar } from "./_components/AgendaToolbar";
import { AgendaWeekView } from "./_components/AgendaWeekView";
import { PrintWeekButton } from "./_components/PrintWeekButton";
import { ResponseLinkModal } from "./_components/ResponseLinkModal";
import { RoutinesSkeleton } from "./_components/RoutinesSkeleton";
import { RoutinesSummary } from "./_components/RoutinesSummary";
import { monthGrid } from "./calendar";
import { useAgenda } from "./useAgenda";
import { useDayOffs } from "./useDayOffs";
import { useMoveItem } from "./useMoveItem";
import { formatWeekRange } from "./utils";

/**
 * A Agenda da pessoa (desde 18/10/2026): as visitas e as ligações dela —
 * inclusive as combinadas com o cliente, que antes eram uma tela à parte —
 * num dia, numa semana ou num mês, como a folhinha do Google Agenda.
 */
export default function AgendaContent({
  canSelectPerson,
}: {
  canSelectPerson: boolean;
}) {
  const agenda = useAgenda(canSelectPerson);
  const {
    view,
    anchor,
    weekStart,
    dates,
    days,
    schedule,
    sellerId,
    isSellerAgenda,
    refetch,
  } = agenda;
  const todayIso = getTodayIso();

  // As folgas do período em tela. Elas vivem fora da rotina de propósito: a
  // folga pode ser marcada antes de a semana existir.
  const { dayOffDates, mark, unmark } = useDayOffs({
    weekStart: dates[0] ?? weekStart,
    to: dates.at(-1),
    skip: !isSellerAgenda || (agenda.canSelectPerson && !sellerId),
    sellerId,
    onChanged: () => refetch(),
  });

  const onChanged = () => {
    void refetch();
  };
  const moveItem = useMoveItem(onChanged);

  return (
    <PageContent>
      <AgendaToolbar
        view={view}
        anchor={anchor}
        weekStart={weekStart}
        isShowingToday={agenda.isShowingToday}
        people={agenda.canSelectPerson ? agenda.people : undefined}
        personId={agenda.personId}
        onSelectPerson={agenda.setPersonId}
        sellerId={sellerId}
        isSellerAgenda={isSellerAgenda}
        onView={agenda.setView}
        onPrev={agenda.goPrev}
        onNext={agenda.goNext}
        onToday={agenda.goToday}
      />

      {agenda.showSkeleton ? (
        <RoutinesSkeleton />
      ) : agenda.error ? (
        <QueryError onRetry={() => refetch()} />
      ) : agenda.hasNoPeople ? (
        <EmptyState.Root>
          <EmptyState.Icon>
            <Users />
          </EmptyState.Icon>
          <EmptyState.Title>Ninguém cadastrado ainda</EmptyState.Title>
          <EmptyState.Description>
            Cadastre as pessoas da empresa para montar e acompanhar a agenda de
            cada uma.
          </EmptyState.Description>
        </EmptyState.Root>
      ) : (
        <>
          {/* O resumo e a folha impressa são da ROTINA de quem vende, e da
              semana inteira. */}
          {view === "week" && isSellerAgenda && schedule && (
            <>
              <RoutinesSummary days={schedule.days} />
              <div className="flex flex-wrap items-center justify-end gap-8">
                <PrintWeekButton
                  scheduleId={schedule.id}
                  weekStart={weekStart}
                  days={schedule.days}
                  sellerName={schedule.seller?.user?.name ?? null}
                  dayOffDates={[...dayOffDates]}
                />
                <ResponseLinkModal
                  scope={{ kind: "week", scheduleId: schedule.id }}
                  dateLabel={`semana de ${formatWeekRange(weekStart)}`}
                  isEmpty={schedule.days.every((day) => day.items.length === 0)}
                />
              </div>
            </>
          )}

          <div data-tour="routines-grid">
            {view === "month" ? (
              <AgendaMonthView
                weeks={monthGrid(anchor)}
                anchor={anchor}
                days={days}
                todayIso={todayIso}
                person={agenda.selectedPerson}
                sellerId={sellerId}
                dayOffDates={dayOffDates}
                onOpenDay={agenda.openDay}
                onMove={moveItem}
                onChanged={onChanged}
              />
            ) : view === "day" ? (
              <AgendaDayView
                date={anchor}
                agendaDay={days.get(anchor)}
                todayIso={todayIso}
                person={agenda.selectedPerson}
                sellerId={sellerId}
                isSellerAgenda={isSellerAgenda}
                isDayOff={dayOffDates.has(anchor)}
                onMarkDayOff={mark}
                onUnmarkDayOff={unmark}
                onChanged={onChanged}
              />
            ) : (
              <AgendaWeekView
                dates={dates}
                days={days}
                todayIso={todayIso}
                person={agenda.selectedPerson}
                sellerId={sellerId}
                dayOffDates={dayOffDates}
                onOpenDay={agenda.openDay}
                onMove={moveItem}
                onChanged={onChanged}
              />
            )}
          </div>
        </>
      )}
    </PageContent>
  );
}
