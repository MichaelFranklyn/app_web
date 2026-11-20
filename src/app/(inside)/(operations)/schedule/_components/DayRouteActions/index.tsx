"use client";

import { VisitScheduleDay } from "../../interface";
import { formatDateLong, sortVisitsByRoute } from "../../utils";
import { PrintRouteButton } from "../PrintRouteButton";
import { ResponseLinkModal } from "../ResponseLinkModal";

interface Props {
  day: VisitScheduleDay;
  sellerName: string | null;
}

/** O dia no papel: a folha da rota e o link para respondê-la no fim do dia. */
export function DayRouteActions({ day, sellerName }: Props) {
  const items = sortVisitsByRoute(day.items);
  const drivingStops = items.filter((item) => item.contactType !== "REMOTE");
  const remoteStops = items.filter((item) => item.contactType === "REMOTE");

  return (
    <>
      <PrintRouteButton
        scheduleDayId={day.id}
        date={day.date}
        stops={drivingStops}
        remoteStops={remoteStops}
        sellerName={sellerName}
        departureAddress={day.departureAddress ?? null}
        routeDistanceKm={day.routeDistanceKm}
        routeDurationMin={day.routeDurationMin}
      />
      <ResponseLinkModal
        scope={{ kind: "day", scheduleDayId: day.id }}
        dateLabel={formatDateLong(day.date)}
        isEmpty={items.length === 0}
      />
    </>
  );
}
