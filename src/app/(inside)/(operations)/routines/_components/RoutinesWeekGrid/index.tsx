"use client";

import { Badge } from "@/components/Badges";
import { getButtonClasses } from "@/components/Button/Root/style";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { ArrowUpRight, Route } from "lucide-react";
import Link from "next/link";
import { VisitScheduleDay } from "../../interface";
import { buildWeekDays, getTodayIso } from "../../utils";
import { GenerateDayButton } from "./GenerateDayButton";
import { AddVisitCard } from "../AddVisitCard";
import { VisitCard } from "../VisitCard";

interface Props {
  weekStart: string;
  /** VisitSchedule da semana exibida (para criar dias em folgas). */
  scheduleId: string;
  days: VisitScheduleDay[];
  sellerId?: string | null;
  /** Vendedor dono da rotina exibida (para agendar visitas na carteira dele). */
  effectiveSellerId?: string | null;
  /** Limite de visitas por dia da agenda do vendedor. */
  maxVisitsPerDay: number;
  /** Quantos dias exibir a rotina, a partir de hoje (7 = semana toda). */
  periodDays: number;
  onChanged: () => void;
}

// Botão âmbar "Ver rota do dia" (link → /routines/[date]).
const routeButtonClass = getButtonClasses({
  appearance: "tinted",
  color: "amber",
  size: "sm",
  isIconOnly: false,
  fullWidth: true,
  active: false,
  noPadding: false,
  noUppercase: true,
});

export function RoutinesWeekGrid({
  weekStart,
  scheduleId,
  days,
  sellerId,
  effectiveSellerId,
  maxVisitsPerDay,
  periodDays,
  onChanged,
}: Props) {
  const cells = buildWeekDays(weekStart, days);
  const todayIso = getTodayIso();
  const addSellerId = effectiveSellerId ?? sellerId ?? null;

  // Janela do período: começa em hoje (se a semana exibida o contém) ou na
  // segunda-feira; cobre `periodDays` dias. "Semana" (>=7) mostra todos os dias.
  const todayIndex = cells.findIndex((c) => c.date === todayIso);
  const anchor = todayIndex >= 0 ? todayIndex : 0;
  const visibleCells =
    periodDays >= 7 ? cells : cells.slice(anchor, anchor + periodDays);

  return (
    <div className="flex gap-8 overflow-x-auto pb-8">
      {visibleCells.map((cell) => {
        const items = cell.day?.items ?? [];
        const isToday = cell.date === todayIso;
        // "Dia seguinte" = próximo dia da semana; só serve como alternativa de
        // agendamento se for um dia útil (tem rotina), não uma folga.
        const globalIndex = cells.indexOf(cell);
        const nextDay = cells[globalIndex + 1]?.day ?? null;
        return (
          // Colunas com largura mínima generosa para o conteúdo não espremer; a
          // faixa rola na horizontal quando não cabem todas. O flex-1 só faz as
          // colunas preencherem a largura quando sobra espaço (poucos dias).
          <div key={cell.date} className="shrink-0 grow basis-[240px]">
            <Card.Root
              className={`h-full ${
                isToday ? "ring-1 ring-(--amber) ring-inset" : ""
              }`}
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
                <div className="flex items-center gap-6">
                  {isToday && (
                    <Badge.Root color="amber" appearance="tinted">
                      <Badge.Text>Hoje</Badge.Text>
                    </Badge.Root>
                  )}
                  <Badge.Root color="neutral" appearance="tinted">
                    <Badge.Text>{items.length}</Badge.Text>
                  </Badge.Root>
                </div>
              </Card.Header>
              <Card.Body>
                {!cell.day ? (
                  // Folga: o usuário ainda pode querer trabalhar neste dia —
                  // gerar a rota automática (pela carteira) ou agendar uma
                  // visita manual (cria o dia com essa primeira visita).
                  <div className="flex flex-col items-center gap-8 py-8">
                    <span className="text-[13px] text-(--muted)">Folga</span>
                    <GenerateDayButton
                      date={cell.date}
                      sellerId={addSellerId}
                      onGenerated={onChanged}
                    />
                    <AddVisitCard
                      day={null}
                      date={cell.date}
                      scheduleId={scheduleId}
                      nextDay={nextDay}
                      sellerId={addSellerId}
                      maxVisitsPerDay={maxVisitsPerDay}
                      onChanged={onChanged}
                    />
                  </div>
                ) : items.length === 0 ? (
                  <div className="py-8 text-center text-[13px] text-(--muted)">
                    Sem visitas
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                    {items.map((item) => (
                      <VisitCard
                        key={item.id}
                        item={item}
                        currentDayId={cell.day!.id}
                        scheduleDays={days}
                        onChanged={onChanged}
                      />
                    ))}
                  </div>
                )}

                {cell.day && (
                  <AddVisitCard
                    day={cell.day}
                    date={cell.date}
                    scheduleId={scheduleId}
                    nextDay={nextDay}
                    sellerId={addSellerId}
                    maxVisitsPerDay={maxVisitsPerDay}
                    onChanged={onChanged}
                  />
                )}

                {cell.day && (
                  <Link
                    href={`/routines/${cell.date}${
                      sellerId ? `?seller=${sellerId}` : ""
                    }`}
                    className={`${routeButtonClass} mt-10`}
                    title="Abrir a rota deste dia no mapa"
                  >
                    <Route size={14} />
                    Ver rota do dia
                  </Link>
                )}
              </Card.Body>
            </Card.Root>
          </div>
        );
      })}
    </div>
  );
}
