"use client";

import { MoreOption, MoreOptions } from "@/components/MoreOptions";
import { CalendarOff, CalendarPlus, Link2, Printer } from "lucide-react";
import { useState } from "react";

import { VisitScheduleDay } from "../../interface";
import { formatDateLong, sortVisitsByRoute } from "../../utils";
import { DayOffButton } from "../DayOffButton";
import { ResponseLinkModal } from "../ResponseLinkModal";
import { usePrintRoute } from "./usePrintRoute";

interface Props {
  date: string;
  /** O dia com rota (rotina de quem vende, com paradas); nulo sem folha. */
  routeDay: VisitScheduleDay | null;
  sellerName: string | null;
  /** "Não vou trabalhar" só no futuro e na rotina de quem vende. */
  canMarkDayOff: boolean;
  isDayOff: boolean;
  pendingCount: number;
  onMarkDayOff: (date: string) => Promise<void>;
  onUnmarkDayOff: (date: string) => Promise<void>;
}

/**
 * O que se faz de vez em quando com o dia — a folha impressa, o link de
 * resposta e a folga — num menu só. À vista fica o "Agendar": quatro botões
 * do mesmo peso no cabeçalho escondiam qual era o principal (crítica de
 * 23/11/2026) e, no celular, empurravam a primeira visita para baixo.
 */
export function DayMoreMenu({
  date,
  routeDay,
  sellerName,
  canMarkDayOff,
  isDayOff,
  pendingCount,
  onMarkDayOff,
  onUnmarkDayOff,
}: Props) {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const [isDayOffOpen, setIsDayOffOpen] = useState(false);

  const items = sortVisitsByRoute(routeDay?.items ?? []);
  const { print, isBusy, isEmpty } = usePrintRoute({
    scheduleDayId: routeDay?.id ?? "",
    date,
    stops: items.filter((item) => item.contactType !== "REMOTE"),
    remoteStops: items.filter((item) => item.contactType === "REMOTE"),
    sellerName,
    departureAddress: routeDay?.departureAddress ?? null,
    routeDistanceKm: routeDay?.routeDistanceKm ?? "0",
    routeDurationMin: routeDay?.routeDurationMin ?? 0,
  });

  const options: MoreOption[] = [
    ...(routeDay
      ? [
          {
            label: isBusy ? "Gerando a folha…" : "Imprimir rota",
            icon: Printer,
            disabled: isEmpty || isBusy,
            onClick: () => void print(),
          },
          {
            label: "Link de resposta",
            icon: Link2,
            disabled: items.length === 0,
            onClick: () => setIsLinkOpen(true),
          },
        ]
      : []),
    ...(canMarkDayOff
      ? [
          {
            label: isDayOff ? "Voltar a trabalhar" : "Não vou trabalhar",
            icon: isDayOff ? CalendarPlus : CalendarOff,
            onClick: () => setIsDayOffOpen(true),
          },
        ]
      : []),
  ];

  if (options.length === 0) return null;

  return (
    <>
      <MoreOptions options={options} label="Mais ações do dia" showLabel />
      {routeDay && (
        <ResponseLinkModal
          scope={{ kind: "day", scheduleDayId: routeDay.id }}
          dateLabel={formatDateLong(routeDay.date)}
          isEmpty={items.length === 0}
          open={isLinkOpen}
          onOpenChange={setIsLinkOpen}
        />
      )}
      {canMarkDayOff && (
        <DayOffButton
          date={date}
          isDayOff={isDayOff}
          pendingCount={pendingCount}
          onMark={onMarkDayOff}
          onUnmark={onUnmarkDayOff}
          open={isDayOffOpen}
          onOpenChange={setIsDayOffOpen}
        />
      )}
    </>
  );
}
