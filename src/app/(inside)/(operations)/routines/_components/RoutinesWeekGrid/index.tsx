"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { ArrowUpRight, CalendarOff } from "lucide-react";
import Link from "next/link";
import { VisitScheduleDay, VisitScheduleItem } from "../../interface";
import {
  VISIT_STATUS_COLOR,
  VISIT_STATUS_LABEL,
  VISIT_URGENCY_BORDER,
  buildWeekDays,
  getTodayIso,
} from "../../utils";
import { VisitActions } from "../VisitActions";

interface Props {
  weekStart: string;
  days: VisitScheduleDay[];
  sellerId?: string | null;
  /** Quantos dias exibir a rotina, a partir de hoje (7 = semana toda). */
  periodDays: number;
  onChanged: () => void;
}

const getClientName = (item: VisitScheduleItem): string => {
  const client = item.clientFactoryLink?.client;
  if (!client) return "Cliente —";
  return client.nomeFantasia ?? client.razaoSocial;
};

const getFactoryName = (item: VisitScheduleItem): string => {
  const factory = item.clientFactoryLink?.factory;
  if (!factory) return "—";
  return factory.nomeFantasia ?? factory.razaoSocial;
};

export function RoutinesWeekGrid({
  weekStart,
  days,
  sellerId,
  periodDays,
  onChanged,
}: Props) {
  const cells = buildWeekDays(weekStart, days);
  const todayIso = getTodayIso();

  // Janela do período: começa em hoje (se a semana exibida o contém) ou na
  // segunda-feira; cobre `periodDays` dias. "Semana" (>=7) não filtra nada.
  const todayIndex = cells.findIndex((c) => c.date === todayIso);
  const anchor = todayIndex >= 0 ? todayIndex : 0;
  const isInPeriod = (index: number) =>
    periodDays >= 7 || (index >= anchor && index < anchor + periodDays);

  return (
    <div className="flex gap-8">
      {cells.map((cell, index) => {
        const items = cell.day?.items ?? [];
        const isToday = cell.date === todayIso;
        const inPeriod = isInPeriod(index);
        return (
          <div key={cell.date} className="min-w-0 flex-1">
            <Card.Root
              className={`h-full ${
                isToday ? "ring-1 ring-(--amber) ring-inset" : ""
              } ${inPeriod ? "" : "opacity-60"}`}
            >
              <Card.Header bg="bg3">
                {cell.day ? (
                  <Link
                    href={`/routines/${cell.date}${
                      sellerId ? `?seller=${sellerId}` : ""
                    }`}
                    className="group flex min-w-0 flex-col"
                    title="Ver rota deste dia"
                  >
                    <Title
                      variant="heading-sm"
                      className="inline-flex items-center gap-3 transition-colors group-hover:text-(--amber)"
                    >
                      {cell.dayLabel}
                      <ArrowUpRight
                        size={12}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                      />
                    </Title>
                    <Title variant="micro" color="muted">
                      {cell.weekdayLabel}
                    </Title>
                  </Link>
                ) : (
                  <div className="flex flex-col">
                    <Title variant="heading-sm">{cell.dayLabel}</Title>
                    <Title variant="micro" color="muted">
                      {cell.weekdayLabel}
                    </Title>
                  </div>
                )}
                <Badge.Root color="neutral" appearance="tinted">
                  <Badge.Text>{items.length}</Badge.Text>
                </Badge.Root>
              </Card.Header>
              <Card.Body>
                {!inPeriod ? (
                  <div className="flex flex-col items-center gap-4 py-12 text-center">
                    <CalendarOff size={18} className="text-(--muted2)" />
                    <Title variant="micro" color="muted">
                      Fora do período
                    </Title>
                  </div>
                ) : !cell.day ? (
                  <div className="py-8 text-center text-[12px] text-(--muted)">
                    Folga
                  </div>
                ) : items.length === 0 ? (
                  <div className="py-8 text-center text-[12px] text-(--muted)">
                    Sem visitas
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-(--r-md) border border-(--border) bg-(--bg3) p-[10px] ${VISIT_URGENCY_BORDER[item.status]}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="truncate text-[12px] font-medium text-(--text)">
                              {getClientName(item)}
                            </div>
                            <div className="truncate text-[10px] text-(--muted)">
                              {getFactoryName(item)}
                            </div>
                          </div>
                          <div className="-mr-[4px] -mt-[2px] shrink-0">
                            <VisitActions
                              item={item}
                              currentDayId={cell.day!.id}
                              scheduleDays={days}
                              onChanged={onChanged}
                            />
                          </div>
                        </div>
                        <div className="mt-[6px] flex items-center justify-between">
                          <Title variant="micro" color="muted">
                            #{item.plannedOrder}
                            {item.estimatedTravelMin != null
                              ? ` · ${item.estimatedTravelMin}m`
                              : ""}
                          </Title>
                          <Badge.Root
                            color={VISIT_STATUS_COLOR[item.status]}
                            appearance="tinted"
                          >
                            <Badge.Text>
                              {VISIT_STATUS_LABEL[item.status]}
                            </Badge.Text>
                          </Badge.Root>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card.Root>
          </div>
        );
      })}
    </div>
  );
}
