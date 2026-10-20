"use client";

import { Badge } from "@/components/Badges";
import { Calendar } from "@/components/Calendar";

import { AgendaDay, dayNumber, WEEKDAY_SHORT } from "../../calendar";
import { AGENDA_DRAG_TYPE, AgendaDrag, readDrag } from "../../dragItem";
import { AgendaPerson } from "../../interface";
import { isPastDay, sortVisitsByRoute } from "../../utils";
import { AgendaAddMenu } from "../AgendaAddMenu";
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
 * A semana em sete colunas, com o cartão compacto de cada compromisso — a
 * semana inteira cabe na tela, e o detalhe abre no clique. O número do dia
 * abre o dia, e o cartão em aberto se arrasta para outro dia.
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
  return (
    <Calendar.Root variant="week">
      {dates.map((date, index) => {
        const agendaDay = days.get(date);
        const items = sortVisitsByRoute(agendaDay?.day?.items ?? []);
        const isDayOff = dayOffDates.has(date);
        const isOpen = !isPastDay(date, todayIso);

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
            />
            <Calendar.CellBody>
              {items.map((item) => (
                <VisitCard
                  key={item.id}
                  item={item}
                  dayDate={date}
                  density="compact"
                  onChanged={onChanged}
                />
              ))}
            </Calendar.CellBody>
            {isOpen && (
              <Calendar.CellFooter>
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
