"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { PageContent } from "@/components/PageContent";
import { Title } from "@/components/Title";
import { CalendarOff, Users } from "lucide-react";

import { GenerateWeekButton } from "./_components/GenerateWeekButton";
import { RoutinesHeader } from "./_components/RoutinesHeader";
import { RoutinesSkeleton } from "./_components/RoutinesSkeleton";
import { RoutinesSummary } from "./_components/RoutinesSummary";
import { RoutinesWeekGrid } from "./_components/RoutinesWeekGrid";
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
  } = useRoutines();

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
            Não há rotina cadastrada para {formatWeekRange(weekStart)}.
            {canGenerateWeek(weekStart)
              ? " Gere a rotina desta semana ou navegue entre as semanas."
              : " Navegue entre as semanas ou volte para a semana atual."}
          </EmptyState.Description>
          <EmptyState.Actions>
            {/* Gerar rotina só faz sentido para a semana atual e a seguinte;
                semanas mais distantes ainda não têm carteira/agenda definida. */}
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

          <div
            className="flex flex-wrap items-center gap-8"
            data-tour="routines-period"
          >
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

          <div data-tour="routines-grid">
            <RoutinesWeekGrid
              weekStart={weekStart}
              scheduleId={schedule.id}
              days={schedule.days}
              sellerId={selectedSellerId}
              effectiveSellerId={effectiveSellerId}
              maxVisitsPerDay={maxVisitsPerDay}
              periodDays={periodDays}
              onChanged={() => refetch()}
            />
          </div>
        </>
      )}
    </PageContent>
  );
}
