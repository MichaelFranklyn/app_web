"use client";

import { addMonths, isAfter, startOfMonth } from "date-fns";
import { useState } from "react";
import { DateRange } from "react-day-picker";

import { CalendarBase } from "./CalendarBase";

/**
 * Mês inicial de cada painel: o começo do período à esquerda e o fim à direita,
 * para o período já escolhido aparecer inteiro ao reabrir. Sem fim (ou com as
 * duas pontas no mesmo mês), a direita mostra o mês seguinte ao da esquerda.
 */
export const initialRangeMonths = (
  range: DateRange | undefined
): [Date, Date] => {
  const left = startOfMonth(range?.from ?? new Date());
  const end = range?.to ? startOfMonth(range.to) : undefined;
  return [left, end && isAfter(end, left) ? end : addMonths(left, 1)];
};

interface Props {
  selected: DateRange | undefined;
  onSelect: (
    range: DateRange | undefined,
    triggerDate: Date | undefined
  ) => void;
}

/**
 * Os dois meses do período são calendários INDEPENDENTES, não um calendário de
 * dois meses: assim mudar o mês/ano de um painel não arrasta o outro.
 *
 * Um `<DayPicker numberOfMonths={2}>` exibe meses sempre consecutivos e liga os
 * dropdowns de todos os painéis ao mesmo `goToMonth`, que define o PRIMEIRO mês
 * da grade — escolher outubro na direita jogava outubro para a esquerda. Com um
 * picker por painel, cada dropdown mexe só no seu mês.
 *
 * Os dois compartilham `selected`/`onSelect`, então o período continua sendo um
 * só: a marcação (início, meio, fim) aparece em qualquer painel que mostre o mês
 * correspondente, e clicar um dia em qualquer um deles alimenta a mesma seleção.
 */
export function RangeCalendars({ selected, onSelect }: Props) {
  const [[leftMonth, rightMonth], setMonths] = useState(() =>
    initialRangeMonths(selected)
  );

  return (
    <div className="tablet:flex-row flex flex-col gap-[16px] p-[12px]">
      <CalendarBase
        mode="range"
        className="p-0"
        selected={selected}
        onSelect={onSelect}
        month={leftMonth}
        onMonthChange={(month) => setMonths(([, right]) => [month, right])}
        autoFocus
      />
      <CalendarBase
        mode="range"
        className="p-0"
        selected={selected}
        onSelect={onSelect}
        month={rightMonth}
        onMonthChange={(month) => setMonths(([left]) => [left, month])}
      />
    </div>
  );
}
