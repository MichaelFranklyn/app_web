"use client";

import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { useUserRole } from "@/services/flowTour/useUserRole";

import { AgendaDay, longDayLabel } from "../../calendar";
import { AgendaPerson } from "../../interface";
import { isPastDay, sortVisitsByRoute } from "../../utils";
import { AgendaAddMenu } from "../AgendaAddMenu";
import { DayOffButton } from "../DayOffButton";
import { DayRoute } from "../DayRoute";
import { DayRouteActions } from "../DayRouteActions";
import { OverdueVisits } from "../OverdueVisits";
import { VisitCard } from "../VisitCard";

interface Props {
  date: string;
  agendaDay: AgendaDay | undefined;
  todayIso: string;
  person: AgendaPerson | null;
  sellerId: string | null;
  isSellerAgenda: boolean;
  /** Quem vende — vai no cabeçalho da folha impressa. */
  sellerName: string | null;
  isDayOff: boolean;
  onMarkDayOff: (date: string) => Promise<void>;
  onUnmarkDayOff: (date: string) => Promise<void>;
  onChanged: () => void;
}

/**
 * Um dia com espaço: os cartões completos (fábricas, score, WhatsApp), o
 * "+ Agendar" e, na rotina de quem vende, a folga e a rota — resumo, partida,
 * mapa e folha impressa. A rota era uma tela à parte (`/agenda/<dia>`), que
 * buscava a agenda por outro caminho e mostrava outra pessoa e outras paradas.
 */
export function AgendaDayView({
  date,
  agendaDay,
  todayIso,
  person,
  sellerId,
  isSellerAgenda,
  sellerName,
  isDayOff,
  onMarkDayOff,
  onUnmarkDayOff,
  onChanged,
}: Props) {
  // Só o vendedor muda a própria partida e responde pelo que houve; o gestor
  // acompanha.
  const isSeller = useUserRole() === "SELLER";
  const day = agendaDay?.day ?? null;
  const items = sortVisitsByRoute(day?.items ?? []);
  const isPast = isPastDay(date, todayIso);
  const pendingCount = items.filter((i) => i.status === "PENDING").length;
  const routeDay = isSellerAgenda && !isDayOff && items.length > 0 ? day : null;
  const hasDrivingStops = items.some((i) => i.contactType !== "REMOTE");

  return (
    <div className="flex flex-col gap-20">
      {/* A dívida do passado só é cobrada HOJE: é a tela de trabalho. Sem
          pessoa escolhida (o próprio vendedor), o backend escopa ao logado. */}
      {date === todayIso && isSellerAgenda && (
        <OverdueVisits
          sellerId={person ? sellerId : null}
          canAnswer={isSeller}
          onAnswered={onChanged}
        />
      )}
      <Card.Root>
        <Card.Header bg="bg3">
          <Title variant="heading-sm" className="first-letter:uppercase">
            {longDayLabel(date)}
          </Title>
          {(routeDay || !isPast) && (
            <Card.Header.Actions>
              {routeDay && (
                <DayRouteActions day={routeDay} sellerName={sellerName} />
              )}
              {!isPast && (
                <AgendaAddMenu
                  variant="header"
                  date={date}
                  person={person}
                  sellerId={sellerId}
                  isDayOff={isDayOff}
                  onChanged={onChanged}
                />
              )}
              {!isPast && isSellerAgenda && (
                <DayOffButton
                  date={date}
                  isDayOff={isDayOff}
                  pendingCount={pendingCount}
                  onMark={onMarkDayOff}
                  onUnmark={onUnmarkDayOff}
                />
              )}
            </Card.Header.Actions>
          )}
        </Card.Header>
        <Card.Body>
          {isDayOff ? (
            <Title variant="body-sm" color="muted" className="text-center">
              Você não trabalha neste dia. O sistema não vai planejar visitas
              para ele.
            </Title>
          ) : items.length === 0 ? (
            <Title variant="body-sm" color="muted" className="text-center">
              Nada marcado neste dia.
            </Title>
          ) : (
            <div className="tablet:grid-cols-2 desktop:grid-cols-3 grid grid-cols-1 gap-8">
              {items.map((item) => (
                <VisitCard
                  key={item.id}
                  item={item}
                  dayDate={date}
                  onChanged={onChanged}
                />
              ))}
            </div>
          )}
        </Card.Body>
      </Card.Root>
      {routeDay && hasDrivingStops && (
        <DayRoute
          day={routeDay}
          canEditDeparture={isSeller}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}
