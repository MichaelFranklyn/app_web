"use client";

import { EmptyState } from "@/components/EmptyState";
import { Grid } from "@/components/Grid";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { useQuery } from "@apollo/client/react";
import { CalendarOff } from "lucide-react";
import { useMemo } from "react";
import { useUserRole } from "@/services/flowTour/useUserRole";
import { OverdueVisits } from "../_components/OverdueVisits";
import { DayNavActions } from "./_components/DayNavActions";
import { DepartureCard } from "./_components/DepartureCard";
import { PrintRouteButton } from "./_components/PrintRouteButton";
import { ResponseLinkModal } from "../_components/ResponseLinkModal";
import { RouteMap } from "./_components/RouteMap";
import { RouteStopsCard } from "./_components/RouteStopsCard";
import { RouteSummary } from "./_components/RouteSummary";
import { VisitsHeader } from "./_components/VisitsHeader";
import { VisitsSkeleton } from "./_components/VisitsSkeleton";
import { PlanWeekLink } from "../_components/PlanWeekLink";
import { getTodayIso, isPastDay } from "../utils";
import { WEEK_SCHEDULE_QUERY } from "./gql";
import { VisitsWeekScheduleResponse } from "./interface";

import { formatDateLong, getWeekMondayIso, shiftDateIso } from "./utils";

interface Props {
  date: string;
  /** Vendedor escolhido (gestor vindo da grade). Ausente = rotina do logado. */
  sellerId?: string | null;
}

export default function DayRouteContent({ date, sellerId }: Props) {
  const weekStart = useMemo(() => getWeekMondayIso(date), [date]);

  // Só o vendedor monta a própria semana; owner/admin apenas visualizam. Dia
  // vencido não recebe parada nova: a visita já não pode acontecer.
  const isSeller = useUserRole() === "SELLER";
  const todayIso = getTodayIso();
  const canGenerate = isSeller && !isPastDay(date, todayIso);
  // A dívida de visitas passadas só é cobrada no dia de HOJE: é a tela de
  // trabalho. Perguntar "o que houve na sexta?" enquanto o vendedor planeja a
  // semana que vem é cobrança fora de hora.
  const isToday = date === todayIso;

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

  const { data, loading, error, refetch } =
    useQuery<VisitsWeekScheduleResponse>(WEEK_SCHEDULE_QUERY, {
      variables: { input: { first: 1, filters } },
      // O score das paradas (latestVisitScore) muda FORA desta página: registrar
      // estoque, concluir visita ou lançar pedido pelo cliente recalcula no
      // backend. Revalida em background a cada mount, mostrando o cache na
      // hora — o skeleton só aparece quando ainda não há dados.
      fetchPolicy: "cache-and-network",
    });

  const schedule = data?.week_schedule.edges[0]?.node;
  const day = schedule?.days.find((d) => d.date === date);
  const sortedStops = useMemo(
    () =>
      day ? [...day.items].sort((a, b) => a.plannedOrder - b.plannedOrder) : [],
    [day]
  );

  // O mapa e o resumo de trajeto são sobre DESLOCAMENTO: um contato remoto não
  // é parada, então entra numa lista à parte em vez de virar um pino na rota.
  const drivingStops = useMemo(
    () => sortedStops.filter((s) => s.contactType !== "REMOTE"),
    [sortedStops]
  );
  const remoteStops = useMemo(
    () => sortedStops.filter((s) => s.contactType === "REMOTE"),
    [sortedStops]
  );

  // Mantém o vendedor escolhido ao navegar entre os dias (gestor).
  const sellerQuery = sellerId ? `?seller=${sellerId}` : "";
  const prevHref = `/routines/${shiftDateIso(date, -1)}${sellerQuery}`;
  const nextHref = `/routines/${shiftDateIso(date, 1)}${sellerQuery}`;

  const dayNav = <DayNavActions prevHref={prevHref} nextHref={nextHref} />;

  if (loading && !schedule) {
    return <VisitsSkeleton />;
  }

  if (error && !schedule) {
    return (
      <PageContent>
        <VisitsHeader
          dateLabel={formatDateLong(date)}
          sellerName={null}
          actions={dayNav}
        />
        <QueryError onRetry={() => refetch()} />
      </PageContent>
    );
  }

  if (!day) {
    return (
      <PageContent>
        <VisitsHeader
          dateLabel={formatDateLong(date)}
          sellerName={schedule?.seller?.user?.name ?? null}
          actions={dayNav}
        />
        {/* Dia sem rota não anula a dívida do passado — pelo contrário, é
            quando o vendedor tem tempo de responder. */}
        {isToday && (
          <OverdueVisits
            sellerId={sellerId}
            canAnswer={isSeller}
            onAnswered={() => refetch()}
          />
        )}
        <EmptyState.Root>
          <EmptyState.Icon>
            <CalendarOff />
          </EmptyState.Icon>
          <EmptyState.Title>Nada marcado neste dia</EmptyState.Title>
          <EmptyState.Description>
            Nada marcado para {formatDateLong(date)}.{" "}
            {canGenerate
              ? "Escolha os clientes da semana em Montar semana, ou use as setas para navegar entre os dias."
              : "Use as setas para navegar entre os dias ou volte para a agenda da semana."}
          </EmptyState.Description>
          {canGenerate && (
            <EmptyState.Actions>
              <PlanWeekLink weekStart={weekStart} sellerId={null} />
            </EmptyState.Actions>
          )}
        </EmptyState.Root>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <VisitsHeader
        dateLabel={formatDateLong(day.date)}
        sellerName={schedule?.seller?.user?.name ?? null}
        actions={
          <>
            {dayNav}
            <PrintRouteButton
              scheduleDayId={day.id}
              date={day.date}
              stops={drivingStops}
              remoteStops={remoteStops}
              sellerName={schedule?.seller?.user?.name ?? null}
              departureAddress={day.departureAddress}
              routeDistanceKm={day.routeDistanceKm}
              routeDurationMin={day.routeDurationMin}
            />
            <ResponseLinkModal
              scope={{ kind: "day", scheduleDayId: day.id }}
              dateLabel={formatDateLong(day.date)}
              isEmpty={drivingStops.length === 0 && remoteStops.length === 0}
            />
          </>
        }
      />

      {/* O que ficou do passado é lembrado numa faixa de uma linha, não numa
          lista: quem abre o dia quer ver a rota. Responder libera a vaga
          daquele dia e reajusta o score de quem já foi visitado — mas isso
          acontece no painel lateral, sem tirar o caminho de hoje da tela. */}
      {isToday && (
        <OverdueVisits
          sellerId={sellerId}
          canAnswer={isSeller}
          onAnswered={() => refetch()}
        />
      )}

      <div data-tour="routine-day-summary">
        <RouteSummary day={day} />
      </div>

      <DepartureCard
        dayId={day.id}
        departureType={day.departureType}
        departureAddress={day.departureAddress}
        canEdit={isSeller}
        onChanged={() => refetch()}
      />

      {/* A agenda vem ANTES do mapa: é o que o vendedor lê para trabalhar o dia
          — o mapa é apoio. Paradas e ligações ficam lado a lado porque são as
          duas metades do mesmo dia; sem ligações, as paradas ocupam a largura
          toda em vez de deixar meia tela vazia. */}
      <Grid.Root
        cols={{ base: 1, desktop: remoteStops.length > 0 ? 2 : 1 }}
        gap={20}
        data-tour="routine-day-stops"
      >
        <Grid.Item>
          <RouteStopsCard
            stops={drivingStops}
            dayDate={day.date}
            onChanged={() => refetch()}
          />
        </Grid.Item>
        {remoteStops.length > 0 && (
          <Grid.Item>
            <RouteStopsCard
              stops={remoteStops}
              dayDate={day.date}
              onChanged={() => refetch()}
              variant="remote"
            />
          </Grid.Item>
        )}
      </Grid.Root>

      <RouteMap
        stops={drivingStops}
        distanceKm={day.routeDistanceKm}
        departureAddress={day.departureAddress}
      />
    </PageContent>
  );
}
