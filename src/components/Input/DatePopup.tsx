import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { CSSProperties, RefObject } from "react";
import { createPortal } from "react-dom";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";

import { CalendarBase } from "./CalendarBase";
import { calendarStyles } from "./styles";

type ShortcutSingle = { label: string; getValue: () => Date };
type ShortcutRange = { label: string; getValue: () => DateRange };

const singleShortcuts: ShortcutSingle[] = [
  { label: "Hoje", getValue: () => new Date() },
  { label: "Ontem", getValue: () => subDays(new Date(), 1) },
  { label: "Amanhã", getValue: () => subDays(new Date(), -1) },
];

const rangeShortcuts: ShortcutRange[] = [
  { label: "Hoje", getValue: () => ({ from: new Date(), to: new Date() }) },
  {
    label: "Ontem",
    getValue: () => ({
      from: subDays(new Date(), 1),
      to: subDays(new Date(), 1),
    }),
  },
  {
    label: "Esta Semana",
    getValue: () => ({
      from: startOfWeek(new Date(), { locale: ptBR }),
      to: endOfWeek(new Date(), { locale: ptBR }),
    }),
  },
  {
    label: "Semana Passada",
    getValue: () => ({
      from: startOfWeek(subWeeks(new Date(), 1), { locale: ptBR }),
      to: endOfWeek(subWeeks(new Date(), 1), { locale: ptBR }),
    }),
  },
  {
    label: "Este Mês",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Mês Passado",
    getValue: () => ({
      from: startOfMonth(subMonths(new Date(), 1)),
      to: endOfMonth(subMonths(new Date(), 1)),
    }),
  },
  {
    label: "Este Ano",
    getValue: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date()),
    }),
  },
];

interface DatePopupProps {
  popupRef: RefObject<HTMLDivElement | null>;
  style: CSSProperties;
  position: "absolute" | "fixed";
  portalTarget: Element;
  variant: "single" | "range";
  internalSingle: Date | undefined;
  internalRange: DateRange | undefined;
  onSelectSingle: (date: Date | undefined) => void;
  onApplyRange: (range: DateRange) => void;
  onSelectRange: (
    range: DateRange | undefined,
    triggerDate: Date | undefined
  ) => void;
}

/** Popup flutuante do InputDate: atalhos na lateral + calendário. */
export const DatePopup = ({
  popupRef,
  style,
  position,
  portalTarget,
  variant,
  internalSingle,
  internalRange,
  onSelectSingle,
  onApplyRange,
  onSelectRange,
}: DatePopupProps) =>
  createPortal(
    <div
      ref={popupRef}
      style={{ ...style, position, zIndex: 9999 }}
      className={cn(calendarStyles.overlay, "w-auto min-w-max flex-row")}
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={calendarStyles.sidebar}>
        {variant === "single"
          ? singleShortcuts.map((shortcut) => (
              <button
                key={shortcut.label}
                type="button"
                className={calendarStyles.sidebarButton}
                onClick={() => onSelectSingle(shortcut.getValue())}
              >
                {shortcut.label}
              </button>
            ))
          : rangeShortcuts.map((shortcut) => (
              <button
                key={shortcut.label}
                type="button"
                className={calendarStyles.sidebarButton}
                onClick={() => onApplyRange(shortcut.getValue())}
              >
                {shortcut.label}
              </button>
            ))}
      </div>

      <div className="bg-(--bg3) p-1">
        {variant === "single" ? (
          <CalendarBase
            mode="single"
            selected={internalSingle}
            onSelect={onSelectSingle}
            defaultMonth={internalSingle}
            initialFocus
          />
        ) : (
          <CalendarBase
            mode="range"
            selected={internalRange}
            onSelect={onSelectRange}
            defaultMonth={internalRange?.from}
            numberOfMonths={2}
            initialFocus
          />
        )}
      </div>
    </div>,
    portalTarget
  );
