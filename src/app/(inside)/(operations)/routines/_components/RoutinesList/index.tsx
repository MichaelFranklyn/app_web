"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { Title } from "@/components/Title";
import { ChevronRight, Route } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { VisitScheduleDay } from "../../interface";
import {
  buildWeekDays,
  getTodayIso,
  getVisibleCells,
  sortVisitsByRoute,
} from "../../utils";
import { AddVisitCard } from "../AddVisitCard";
import { GenerateDayButton } from "../RoutinesWeekGrid/GenerateDayButton";
import { VisitRow } from "./VisitRow";

interface Props {
  weekStart: string;
  scheduleId: string;
  days: VisitScheduleDay[];
  sellerId?: string | null;
  effectiveSellerId?: string | null;
  maxVisitsPerDay: number;
  periodDays: number;
  onChanged: () => void;
}

// Modo lista da rotina: um grupo por dia, empilhados. Cada dia é colapsável e
// vem fechado — só o dia de hoje abre sozinho — para caber na tela sem um scroll
// interminável; o usuário abre os demais quando quiser.
export function RoutinesList({
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
  const visibleCells = getVisibleCells(cells, periodDays, todayIso);

  // Dias abertos. Começa só com hoje; abrir/fechar é livre depois. Se hoje não
  // está no período exibido, abre o primeiro dia com rotina para não ficar tudo
  // fechado.
  const [openDates, setOpenDates] = useState<Set<string>>(() => {
    const hasToday = visibleCells.some((c) => c.date === todayIso);
    if (hasToday) return new Set([todayIso]);
    const firstWithDay = visibleCells.find((c) => c.day);
    return new Set(firstWithDay ? [firstWithDay.date] : []);
  });

  const toggleDate = (date: string) =>
    setOpenDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });

  return (
    <div className="flex flex-col gap-8">
      {visibleCells.map((cell) => {
        // Ordenadas pela sequência da rota (plannedOrder), como no dia.
        const items = sortVisitsByRoute(cell.day?.items ?? []);
        const isToday = cell.date === todayIso;
        const isOpen = openDates.has(cell.date);
        const doneCount = items.filter((i) => i.status === "COMPLETED").length;
        const allDone = items.length > 0 && doneCount === items.length;
        // nextDay usa o índice global (dia seguinte da semana), não o da janela
        // visível, para "agendar no dia seguinte" funcionar igual ao kanban.
        const globalIndex = cells.indexOf(cell);
        const nextDay = cells[globalIndex + 1]?.day ?? null;

        return (
          <Card.Root
            key={cell.date}
            className={isToday ? "ring-1 ring-(--amber) ring-inset" : ""}
          >
            {/* Cabeçalho do dia: botão de abrir/fechar + atalho para a rota do
                dia (sempre visível, mesmo com o dia fechado). O link fica FORA do
                botão — <a> dentro de <button> é HTML inválido. */}
            <div className="flex items-stretch bg-(--bg3)">
              <button
                type="button"
                onClick={() => toggleDate(cell.date)}
                aria-expanded={isOpen}
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-12 px-16 py-12 text-left transition-colors hover:bg-(--bg2)"
              >
                <ChevronRight
                  size={16}
                  className={`shrink-0 text-(--muted) transition-transform ${
                    isOpen ? "rotate-90" : ""
                  }`}
                />
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-8">
                  <Title variant="heading-sm">{cell.dayLabel}</Title>
                  <Title variant="micro" color="muted">
                    {cell.weekdayLabel}
                  </Title>
                  {isToday && (
                    <Badge.Root color="amber" appearance="tinted">
                      <Badge.Text>Hoje</Badge.Text>
                    </Badge.Root>
                  )}
                  <Badge.Root
                    color={allDone ? "green" : "neutral"}
                    appearance="tinted"
                    title={
                      items.length > 0
                        ? `${doneCount} de ${items.length} concluída(s)`
                        : "Sem visitas"
                    }
                  >
                    <Badge.Text>
                      {doneCount > 0
                        ? `${doneCount}/${items.length}`
                        : items.length}
                    </Badge.Text>
                  </Badge.Root>
                </div>
              </button>
              {cell.day && (
                <Link
                  href={`/routines/${cell.date}${
                    sellerId ? `?seller=${sellerId}` : ""
                  }`}
                  className="flex shrink-0 items-center gap-4 border-l border-(--border) px-16 text-(--muted) transition-colors hover:text-(--amber)"
                  title="Abrir a rota deste dia no mapa"
                >
                  <Route size={14} />
                  <Title
                    variant="micro"
                    weight="medium"
                    className="tablet:inline hidden text-inherit"
                  >
                    Ver rota
                  </Title>
                </Link>
              )}
            </div>

            {isOpen && (
              <div className="flex flex-col">
                {/* Visitas do dia (linhas divididas). */}
                {cell.day && items.length > 0 && (
                  <div className="flex flex-col">
                    {items.map((item) => (
                      <VisitRow
                        key={item.id}
                        item={item}
                        currentDayId={cell.day!.id}
                        scheduleDays={days}
                        onChanged={onChanged}
                      />
                    ))}
                  </div>
                )}

                {/* Dia sem visitas / folga. */}
                {items.length === 0 && (
                  <div className="flex flex-wrap items-center gap-12 px-16 py-12">
                    <Title variant="body-sm" color="muted">
                      {cell.day ? "Sem visitas" : "Folga"}
                    </Title>
                    {!cell.day && (
                      <GenerateDayButton
                        date={cell.date}
                        sellerId={addSellerId}
                        onGenerated={onChanged}
                      />
                    )}
                  </div>
                )}

                {/* Rodapé: adicionar visita neste dia (também cria o dia numa
                    folga). O atalho para a rota fica no cabeçalho. */}
                <div className="border-t border-(--border) p-16">
                  <AddVisitCard
                    day={cell.day}
                    date={cell.date}
                    scheduleId={scheduleId}
                    nextDay={nextDay}
                    sellerId={addSellerId}
                    maxVisitsPerDay={maxVisitsPerDay}
                    onChanged={onChanged}
                  />
                </div>
              </div>
            )}
          </Card.Root>
        );
      })}
    </div>
  );
}
