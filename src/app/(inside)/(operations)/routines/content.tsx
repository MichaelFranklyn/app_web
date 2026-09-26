"use client";
import { ToggleGroup } from "@/components/ToggleGroup";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { CalendarOff, Users } from "lucide-react";

import { GenerateWeekButton } from "./_components/GenerateWeekButton";
import { PrintWeekButton } from "./_components/PrintWeekButton";
import { ResponseLinkModal } from "./_components/ResponseLinkModal";
import { RadarMap } from "./_components/RadarMap";
import { RegenerateWeekButton } from "./_components/RegenerateWeekButton";
import { RoutinesHeader } from "./_components/RoutinesHeader";
import { RoutinesList } from "./_components/RoutinesList";
import { RoutinesSkeleton } from "./_components/RoutinesSkeleton";
import { RoutinesSummary } from "./_components/RoutinesSummary";
import { RoutinesViewToggle } from "./_components/RoutinesViewToggle";
import { RoutinesWeekGrid } from "./_components/RoutinesWeekGrid";
import { useDayOffs } from "./useDayOffs";
import { useRoutines } from "./useRoutines";
import { canGenerateWeek, formatWeekRange } from "./utils";

// Quantos dias da rotina exibir (a partir de hoje); 7 = semana inteira.
const PERIOD_OPTIONS = [
  { label: "Hoje", value: 1 },
  { label: "3 dias", value: 3 },
  { label: "5 dias", value: 5 },
  { label: "Semana", value: 7 },
];

export default function RoutinesContent() {
  const {
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
    effectiveSellerId,
    capacity,
    schedule,
    showSkeleton,
    error,
    hasNoSellers,
    isCurrentWeek,
    handlePrevWeek,
    handleNextWeek,
    handleCurrentWeek,
    refetch,
  } = useRoutines();

  // Os dias não trabalhados da semana em tela. Vivem fora da rotina de
  // propósito: a folga pode ser marcada antes de a semana existir, e é assim
  // que o job de segunda já a encontra.
  const { dayOffDates, mark, unmark } = useDayOffs({
    weekStart,
    sellerId: effectiveSellerId,
    onChanged: () => refetch(),
  });

  return (
    <PageContent>
      <RoutinesHeader
        weekStart={weekStart}
        sellers={canSelectSeller ? sellers : undefined}
        selectedSellerId={selectedSellerId}
        effectiveSellerId={effectiveSellerId}
        onVisitScheduled={() => refetch()}
        onSelectSeller={setSelectedSellerId}
        onSelectDate={setWeekStart}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onCurrentWeek={handleCurrentWeek}
      />

      {showSkeleton ? (
        <RoutinesSkeleton />
      ) : error ? (
        <QueryError onRetry={() => refetch()} />
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
            Não há rotina cadastrada para {formatWeekRange(weekStart)}.
            {canGenerateWeek(weekStart)
              ? " Gere a rotina desta semana ou navegue entre as semanas."
              : " A rotina é gerada uma semana por vez, na semana em que ela" +
                " começa. Volte para a semana atual para gerá-la."}
          </EmptyState.Description>
          <EmptyState.Actions>
            {/* Gerar rotina só na semana atual: o plano é feito para a semana
                que já começou, senão nasce com o score defasado. */}
            {canGenerateWeek(weekStart) && (
              <GenerateWeekButton
                weekStart={weekStart}
                sellerId={selectedSellerId}
                onGenerated={() => refetch()}
              />
            )}
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

          <div className="flex flex-wrap items-center justify-between gap-16">
            <div
              className="flex flex-wrap items-center gap-8"
              data-tour="routines-period"
            >
              <Title variant="body-xs" color="muted" weight="medium">
                Período:
              </Title>
              <ToggleGroup
                aria-label="Período"
                options={PERIOD_OPTIONS}
                value={periodDays}
                onChange={setPeriodDays}
              />
            </div>

            <div className="flex flex-wrap items-center gap-8">
              {/* Refazer só na semana atual — o mesmo recorte do botão de
                  gerar, e o backend recusa dias que já passaram. */}
              {canGenerateWeek(weekStart) && (
                <RegenerateWeekButton
                  weekStart={weekStart}
                  sellerId={selectedSellerId}
                  isConfirmed={schedule.status === "CONFIRMED"}
                  onRegenerated={() => refetch()}
                />
              )}
              {/* A folha sai com a SEMANA inteira, não com o recorte do
                  seletor de período ao lado: "Hoje/3 dias" é conveniência de
                  leitura na grade, e um papel intitulado "rotina da semana"
                  com três dias seria arquivado como se fosse a semana toda. */}
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
              <RoutinesViewToggle value={viewMode} onChange={setViewMode} />
            </div>
          </div>

          <div data-tour="routines-grid">
            {viewMode === "radar" ? (
              <RadarMap sellerId={effectiveSellerId} />
            ) : viewMode === "list" ? (
              <RoutinesList
                weekStart={weekStart}
                scheduleId={schedule.id}
                days={schedule.days}
                sellerId={selectedSellerId}
                effectiveSellerId={effectiveSellerId}
                capacity={capacity}
                periodDays={periodDays}
                dayOffDates={dayOffDates}
                onChanged={() => refetch()}
              />
            ) : (
              <RoutinesWeekGrid
                weekStart={weekStart}
                scheduleId={schedule.id}
                days={schedule.days}
                sellerId={selectedSellerId}
                effectiveSellerId={effectiveSellerId}
                capacity={capacity}
                periodDays={periodDays}
                dayOffDates={dayOffDates}
                onMarkDayOff={mark}
                onUnmarkDayOff={unmark}
                onChanged={() => refetch()}
              />
            )}
          </div>
        </>
      )}
    </PageContent>
  );
}
