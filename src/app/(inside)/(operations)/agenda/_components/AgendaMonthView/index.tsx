"use client";

import { Button } from "@/components/Button";
import { Calendar } from "@/components/Calendar";
import { Title } from "@/components/Title";
import { useState } from "react";

import {
  AgendaDay,
  dayNumber,
  isSameMonth,
  WEEKDAY_SHORT,
} from "../../calendar";
import { AGENDA_DRAG_TYPE, AgendaDrag, readDrag } from "../../dragItem";
import { AgendaPerson } from "../../interface";
import { isPastDay, sortVisitsByRoute } from "../../utils";
import { AgendaAddMenu } from "../AgendaAddMenu";
import { AgendaChip } from "../AgendaChip";

/** Quantos compromissos cabem na célula do mês antes do "+N mais". */
const SHOWN_PER_DAY = 3;

interface Props {
  weeks: string[][];
  anchor: string;
  days: Map<string, AgendaDay>;
  todayIso: string;
  person: AgendaPerson | null;
  sellerId: string | null;
  dayOffDates: Set<string>;
  onOpenDay: (date: string) => void;
  onMove: (drag: AgendaDrag, toDate: string) => void;
  onChanged: () => void;
}

/**
 * O mês na folhinha. Cada dia mostra os primeiros compromissos e quantos
 * faltam — o "+N mais" abre a lista ali mesmo. O número abre o dia, e o vazio
 * do dia agenda um contato ou uma visita. Os compromissos se arrastam de um dia para outro. No
 * celular a célula é estreita demais para nomes: fica só a contagem.
 */
export function AgendaMonthView({
  weeks,
  anchor,
  days,
  todayIso,
  person,
  sellerId,
  dayOffDates,
  onOpenDay,
  onMove,
  onChanged,
}: Props) {
  // Dias abertos pelo "+N mais": a célula cresce e mostra todos ali mesmo.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const toggleExpanded = (date: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (!next.delete(date)) next.add(date);
      return next;
    });

  return (
    <Calendar.Root variant="month">
      <Calendar.Weekdays labels={WEEKDAY_SHORT} />
      {weeks.flat().map((date) => {
        const items = sortVisitsByRoute(days.get(date)?.day?.items ?? []);
        const hidden = items.length - SHOWN_PER_DAY;
        const isExpanded = expanded.has(date);
        const isDayOff = dayOffDates.has(date);
        const isOpen = !isPastDay(date, todayIso);

        return (
          <Calendar.Cell
            key={date}
            variant="month"
            isOutside={!isSameMonth(date, anchor)}
            isOff={isDayOff}
            dropType={isOpen && !isDayOff ? AGENDA_DRAG_TYPE : undefined}
            onDropData={(raw) => {
              const drag = readDrag(raw);
              if (drag) onMove(drag, date);
            }}
          >
            {isOpen && (
              <AgendaAddMenu
                variant="cell"
                date={date}
                person={person}
                sellerId={sellerId}
                isDayOff={isDayOff}
                onChanged={onChanged}
              />
            )}
            <Calendar.CellHeader
              day={dayNumber(date)}
              isToday={date === todayIso}
              onOpen={() => onOpenDay(date)}
              openLabel="Abrir este dia"
              passThrough={isOpen}
            />
            <Calendar.CellBody passThrough={isOpen}>
              <div className="tablet:flex pointer-events-auto hidden min-w-0 flex-col gap-2">
                {(isExpanded ? items : items.slice(0, SHOWN_PER_DAY)).map(
                  (item) => (
                    <AgendaChip
                      key={item.id}
                      item={item}
                      dayDate={date}
                      size="sm"
                      onChanged={onChanged}
                    />
                  )
                )}
                {hidden > 0 && (
                  <Button.Root
                    type="button"
                    appearance="ghost"
                    color="neutral"
                    size="sm"
                    noUppercase
                    label={
                      isExpanded
                        ? "Mostrar menos"
                        : `Mostrar os ${items.length} compromissos aqui`
                    }
                    onClick={() => toggleExpanded(date)}
                  >
                    <Button.Title>
                      {isExpanded ? "Mostrar menos" : `+${hidden} mais`}
                    </Button.Title>
                  </Button.Root>
                )}
              </div>
              {items.length > 0 && (
                <Title
                  variant="micro"
                  color="muted"
                  className="tablet:hidden text-center"
                >
                  {items.length}
                </Title>
              )}
            </Calendar.CellBody>
          </Calendar.Cell>
        );
      })}
    </Calendar.Root>
  );
}
