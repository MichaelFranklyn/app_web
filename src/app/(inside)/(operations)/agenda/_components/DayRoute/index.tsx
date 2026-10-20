"use client";

import { VisitScheduleDay } from "../../interface";
import { sortVisitsByRoute } from "../../utils";
import { DepartureCard } from "../DepartureCard";
import { RouteMap } from "../RouteMap";
import { RouteSummary } from "../RouteSummary";

interface Props {
  day: VisitScheduleDay;
  /** Só quem vende muda a própria partida; o gestor acompanha. */
  canEditDeparture: boolean;
  onChanged: () => void;
}

/**
 * O trajeto do dia, embaixo dos cartões: o resumo, de onde sai e o mapa. Os
 * cartões vêm antes porque são o que se trabalha — o mapa é apoio.
 *
 * Tudo aqui é sobre DESLOCAMENTO: uma ligação está no dia, mas não é parada, e
 * não vira pino na rota.
 */
export function DayRoute({ day, canEditDeparture, onChanged }: Props) {
  const drivingStops = sortVisitsByRoute(day.items).filter(
    (item) => item.contactType !== "REMOTE"
  );

  return (
    <>
      <RouteSummary day={day} />
      <DepartureCard
        dayId={day.id}
        departureType={day.departureType}
        departureAddress={day.departureAddress ?? null}
        canEdit={canEditDeparture}
        onChanged={onChanged}
      />
      <RouteMap
        stops={drivingStops}
        distanceKm={day.routeDistanceKm}
        departureAddress={day.departureAddress}
      />
    </>
  );
}
