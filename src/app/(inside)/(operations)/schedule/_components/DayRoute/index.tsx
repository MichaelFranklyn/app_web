"use client";

import { useQuery } from "@apollo/client/react";
import { useEffect, useRef } from "react";

import { itemClient } from "../../calendar";
import { CROSS_OFFICE_DAY_ROUTE_QUERY } from "../../gql";
import {
  CrossOfficeDayRouteData,
  CrossOfficeStop,
  VisitScheduleDay,
} from "../../interface";
import {
  crossOfficeMapsQuery,
  mapsQuery,
  sortVisitsByRoute,
} from "../../utils";
import { DepartureCard } from "../DepartureCard";
import { RouteMap } from "../RouteMap";
import { RouteSummary } from "../RouteSummary";

interface Props {
  date: string;
  /** O dia de cá — nulo quando só o outro escritório tem parada nele. */
  day: VisitScheduleDay | null;
  /** Só quem vende muda a própria partida; o gestor acompanha. */
  canEditDeparture: boolean;
  /** As paradas do outro escritório da pessoa que pedem cartão próprio. */
  otherOfficeStops?: CrossOfficeStop[];
  onChanged: () => void;
}

const isDriving = (stop: { contactType: string }) =>
  stop.contactType !== "REMOTE";

/**
 * O trajeto do dia, embaixo dos cartões: o resumo, de onde sai e o mapa. Os
 * cartões vêm antes porque são o que se trabalha — o mapa é apoio.
 *
 * Tudo aqui é sobre DESLOCAMENTO: uma ligação está no dia, mas não é parada, e
 * não vira pino na rota.
 *
 * Quando a pessoa tem visita presencial noutro escritório no dia, a rota é uma
 * só: o resumo e o mapa vêm de `crossOfficeDayRoute`, que soma as paradas dos
 * dois (calculada na leitura — o dia gravado de cada escritório não muda).
 */
export function DayRoute({
  date,
  day,
  canEditDeparture,
  otherOfficeStops = [],
  onChanged,
}: Props) {
  const ourStops = sortVisitsByRoute(day?.items ?? []).filter(isDriving);
  // A visita de lá que se juntou a uma parada daqui já está nela (é o selo).
  const theirStops = otherOfficeStops.filter(isDriving);
  const hasTheirs = theirStops.length > 0;

  const { data, refetch } = useQuery<CrossOfficeDayRouteData>(
    CROSS_OFFICE_DAY_ROUTE_QUERY,
    { variables: { date }, skip: !hasTheirs, fetchPolicy: "cache-and-network" }
  );
  const combined = hasTheirs ? (data?.crossOfficeDayRoute?.data ?? null) : null;

  // Concluir, desmarcar, mover ou trocar a partida muda a rota: refaz a soma.
  const signature = [
    day?.departureType,
    day?.departureAddress,
    ...ourStops.map((s) => `${s.id}:${s.status}`),
    ...theirStops.map((s) => `${s.id}:${s.status}`),
  ].join("|");
  const lastSignature = useRef(signature);
  useEffect(() => {
    if (lastSignature.current === signature) return;
    lastSignature.current = signature;
    if (hasTheirs) void refetch();
  }, [signature, hasTheirs, refetch]);

  // Endereços na ordem do trajeto: a combinada, quando já veio; senão as de
  // cá na ordem da rota e as de lá no fim.
  const addressOf = new Map<string, string | null>([
    ...ourStops.map((s) => [s.id, mapsQuery(itemClient(s))] as const),
    ...theirStops.map((s) => [s.id, crossOfficeMapsQuery(s)] as const),
  ]);
  const points = (
    combined?.order ?? [...ourStops, ...theirStops].map((s) => s.id)
  )
    .map((id) => addressOf.get(id))
    .filter((q): q is string => Boolean(q));

  return (
    <>
      <RouteSummary
        day={day}
        theirStopCount={theirStops.length}
        combined={combined}
      />
      {day && (
        <DepartureCard
          dayId={day.id}
          departureType={day.departureType}
          departureAddress={day.departureAddress ?? null}
          canEdit={canEditDeparture}
          onChanged={onChanged}
        />
      )}
      <RouteMap
        points={points}
        stopCount={combined?.stopCount ?? ourStops.length + theirStops.length}
        distanceKm={combined?.distanceKm ?? day?.routeDistanceKm ?? "0"}
        departureAddress={
          combined ? combined.departureAddress : day?.departureAddress
        }
      />
    </>
  );
}
