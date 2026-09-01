"use client";

import { RoutineCapacity, VisitScheduleDay } from "../../interface";
import { buildWeekDays, getTodayIso, getVisibleCells } from "../../utils";
import { DayCell } from "./DayCell";

interface Props {
  weekStart: string;
  /** VisitSchedule da semana exibida (para criar os dias que faltarem). */
  scheduleId: string;
  days: VisitScheduleDay[];
  sellerId?: string | null;
  /** Vendedor dono da rotina exibida (para agendar visitas na carteira dele). */
  effectiveSellerId?: string | null;
  /** Limite de visitas por dia da agenda do vendedor. */
  capacity: RoutineCapacity;
  /** Quantos dias exibir a rotina, a partir de hoje (7 = semana toda). */
  periodDays: number;
  /** Datas ISO que o vendedor marcou como não trabalhadas. */
  dayOffDates: Set<string>;
  onMarkDayOff: (date: string) => Promise<void>;
  onUnmarkDayOff: (date: string) => Promise<void>;
  onChanged: () => void;
}

export function RoutinesWeekGrid({
  weekStart,
  scheduleId,
  days,
  sellerId,
  effectiveSellerId,
  capacity,
  periodDays,
  dayOffDates,
  onMarkDayOff,
  onUnmarkDayOff,
  onChanged,
}: Props) {
  const cells = buildWeekDays(weekStart, days);
  const todayIso = getTodayIso();
  const addSellerId = effectiveSellerId ?? sellerId ?? null;
  const visibleCells = getVisibleCells(cells, periodDays, todayIso);

  // items-stretch (e não items-start): num kanban as colunas têm de terminar na
  // mesma linha. O dia sem rota tem pouco conteúdo, mas acompanha a altura do
  // dia mais cheio e completa o resto com espaço em branco.
  return (
    <div className="flex items-stretch gap-8 overflow-x-auto pb-8">
      {visibleCells.map((cell) => {
        // "Dia seguinte" = próximo dia da semana; só serve como alternativa de
        // agendamento se for um dia útil (tem rotina), não um dia vazio.
        const globalIndex = cells.indexOf(cell);
        const nextDay = cells[globalIndex + 1]?.day ?? null;
        return (
          // Largura travada em 290px (mínimo = máximo): a coluna do dia não
          // estica quando há poucos dias em tela nem comprime quando há muitos
          // — quando as 7 não cabem, a faixa rola na horizontal.
          <DayCell
            key={cell.date}
            cell={cell}
            todayIso={todayIso}
            scheduleId={scheduleId}
            sellerId={sellerId}
            addSellerId={addSellerId}
            capacity={capacity}
            nextDay={nextDay}
            isDayOff={dayOffDates.has(cell.date)}
            onMarkDayOff={onMarkDayOff}
            onUnmarkDayOff={onUnmarkDayOff}
            onChanged={onChanged}
          />
        );
      })}
    </div>
  );
}
