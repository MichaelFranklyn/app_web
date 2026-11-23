"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Calendar } from "@/components/Calendar";
import { useState } from "react";

import {
  AgendaDay,
  alsoInOfficeOf,
  dayNumber,
  WEEKDAY_SHORT,
} from "../../calendar";
import { AGENDA_DRAG_TYPE, AgendaDrag, readDrag } from "../../dragItem";
import { AgendaPerson } from "../../interface";
import { isPastDay, sortVisitsByRoute } from "../../utils";
import { AgendaAddMenu } from "../AgendaAddMenu";
import { OtherOfficeStopCard } from "../OtherOfficeStop";
import { VisitCard } from "../VisitCard";

interface Props {
  dates: string[];
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
 * Quantos cartões cada dia mostra antes do "Mais N…": num dia cheio a coluna
 * descia além da tela e escondia a semana (pedido de 23/11/2026).
 */
const CARDS_SHOWN = 5;

/** Sábado e domingo — a semana começa na segunda (índice 0). */
const WEEKEND_INDEXES = [5, 6];

/**
 * A semana em sete colunas, com o cartão compacto de cada compromisso — a
 * semana inteira cabe na tela, e o detalhe abre no clique. O número do dia
 * abre o dia, e o cartão em aberto se arrasta para outro dia.
 *
 * No desktop, cada dia recolhe numa faixa estreita (como a coluna do Jira) e
 * os outros ganham a largura — o fim de semana vazio deixa de roubar espaço
 * dos cartões. A escolha é por dia da semana, não por data: recolher o sábado
 * vale também ao trocar de semana. Sábado e domingo começam recolhidos: a
 * semana de trabalho é de segunda a sexta, e o fim de semana abre num clique.
 */
export function AgendaWeekView({
  dates,
  days,
  todayIso,
  person,
  sellerId,
  dayOffDates,
  onOpenDay,
  onMove,
  onChanged,
}: Props) {
  const [collapsedWeekdays, setCollapsedWeekdays] = useState<Set<number>>(
    () => new Set(WEEKEND_INDEXES)
  );
  const toggleWeekday = (index: number) =>
    setCollapsedWeekdays((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  // Os dias abertos além dos cinco primeiros cartões.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const toggleExpanded = (date: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });

  return (
    <Calendar.Root
      variant="week"
      collapsed={dates.map((_, index) => collapsedWeekdays.has(index))}
    >
      {dates.map((date, index) => {
        const agendaDay = days.get(date);
        const items = sortVisitsByRoute(agendaDay?.day?.items ?? []);
        const otherOffices = agendaDay?.otherOffices ?? [];
        const isDayOff = dayOffDates.has(date);
        const isOpen = !isPastDay(date, todayIso);
        const isCollapsed = collapsedWeekdays.has(index);

        return (
          <Calendar.Cell
            key={date}
            variant="week"
            isOff={isDayOff}
            dropType={isOpen && !isDayOff ? AGENDA_DRAG_TYPE : undefined}
            onDropData={(raw) => {
              const drag = readDrag(raw);
              if (drag) onMove(drag, date);
            }}
          >
            <Calendar.CellHeader
              weekday={WEEKDAY_SHORT[index]}
              day={dayNumber(date)}
              isToday={date === todayIso}
              onOpen={() => onOpenDay(date)}
              openLabel="Abrir este dia"
              aside={
                isDayOff ? (
                  <Badge.Root color="neutral" appearance="tinted">
                    <Badge.Text>Não trabalha</Badge.Text>
                  </Badge.Root>
                ) : null
              }
              collapse={{
                isCollapsed,
                onToggle: () => toggleWeekday(index),
                count: items.length + otherOffices.length,
              }}
            />
            <Calendar.CellBody isCollapsed={isCollapsed}>
              {[
                ...items.map((item) => (
                  <VisitCard
                    key={item.id}
                    item={item}
                    dayDate={date}
                    density="compact"
                    alsoInOffice={alsoInOfficeOf(item, agendaDay?.alsoInOffice)}
                    onChanged={onChanged}
                  />
                )),
                ...otherOffices.map((stop) => (
                  <OtherOfficeStopCard
                    key={stop.id}
                    stop={stop}
                    density="compact"
                    onChanged={onChanged}
                  />
                )),
              ].filter((_, index) => expanded.has(date) || index < CARDS_SHOWN)}
              {items.length + otherOffices.length > CARDS_SHOWN && (
                <Button.Root
                  type="button"
                  appearance="ghost"
                  color="neutral"
                  size="xs"
                  fullWidth
                  aria-expanded={expanded.has(date)}
                  onClick={() => toggleExpanded(date)}
                >
                  <Button.Title>
                    {expanded.has(date)
                      ? "Mostrar menos"
                      : `Mais ${items.length + otherOffices.length - CARDS_SHOWN}…`}
                  </Button.Title>
                </Button.Root>
              )}
            </Calendar.CellBody>
            {isOpen && (
              <Calendar.CellFooter isCollapsed={isCollapsed}>
                <AgendaAddMenu
                  date={date}
                  person={person}
                  sellerId={sellerId}
                  isDayOff={isDayOff}
                  onChanged={onChanged}
                />
              </Calendar.CellFooter>
            )}
          </Calendar.Cell>
        );
      })}
    </Calendar.Root>
  );
}
