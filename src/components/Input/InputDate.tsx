"use client";

import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import {
  format,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  subWeeks,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { InputRoot } from "./Root";
import { InputLabel } from "./Label";
import { InputHint } from "./Hint";
import { InputControl } from "./Control";
import { InputGroup } from "./Group";
import { InputAddon } from "./Addon";
import { useInputContext } from "./context";
import { inputStyles, calendarStyles, selectStyles } from "./styles";
import { InputBaseProps } from "./InputText";
import { CalendarBase } from "./CalendarBase";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useModalPortal } from "@/components/Modal";

export interface InputDateProps extends Omit<
  InputBaseProps,
  "value" | "onChange" | "defaultValue"
> {
  variant?: "single" | "range";
  value?: Date | DateRange | null;
  onChange?: (date: Date | DateRange | undefined | null) => void;
  onClose?: () => void;
  disabledClear?: boolean;
}

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

export const InputDate = ({
  label,
  hint,
  error,
  success,
  addon,
  className,
  containerClassName,
  variant = "single",
  value,
  onChange,
  onClose,
  disabledClear,
  placeholder,
  ...props
}: InputDateProps) => {
  const isError = !!error;
  const hintMessage = typeof error === "string" ? error : hint;

  return (
    <InputRoot
      error={isError}
      success={success}
      disabled={props.disabled}
      className={containerClassName}
    >
      {label && <InputLabel>{label}</InputLabel>}

      {addon ? (
        <InputGroup className="relative overflow-visible">
          <InputAddon>{addon}</InputAddon>
          <InputDateControl
            className={className}
            variant={variant}
            value={value}
            onChange={onChange}
            onClose={onClose}
            disabledClear={disabledClear}
            placeholder={placeholder}
            {...props}
          />
        </InputGroup>
      ) : (
        <div className="relative w-full">
          <InputDateControl
            className={className}
            variant={variant}
            value={value}
            onChange={onChange}
            onClose={onClose}
            disabledClear={disabledClear}
            placeholder={placeholder}
            {...props}
          />
        </div>
      )}

      {hintMessage && <InputHint>{hintMessage}</InputHint>}
    </InputRoot>
  );
};

const InputDateControl = ({
  className,
  variant,
  value,
  onChange,
  onClose,
  disabledClear,
  placeholder,
  ...props
}: InputDateProps) => {
  const context = useInputContext();
  const containerRef = useRef<HTMLDivElement>(null);

  const disabled = context?.disabled || props.disabled;
  const isError = context?.error;
  const isSuccess = context?.success;
  const inGroup = context?.inGroup;

  const portalAnchor = useModalPortal();

  const [open, setOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const popupRef = useRef<HTMLDivElement>(null);

  // Track internal state for uncontrolled usage
  const [internalSingle, setInternalSingle] = useState<Date | undefined>(
    value instanceof Date ? value : undefined
  );
  const [internalRange, setInternalRange] = useState<DateRange | undefined>(
    value && !(value instanceof Date) ? value : undefined
  );

  // Sync props to internal state — but never while the popup is open, otherwise
  // a parent re-render between range clicks would wipe the user's partial selection.
  useEffect(() => {
    if (open) return;
    if (variant === "single") {
      setInternalSingle(value instanceof Date ? value : undefined);
    } else {
      setInternalRange(value && !(value instanceof Date) ? value : undefined);
    }
  }, [value, variant, open]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (containerRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // Stop native mousedown inside the popup from bubbling to the document
  // outside-click listener. React's synthetic stopPropagation isn't enough —
  // the native event still reaches `document.addEventListener` listeners,
  // which would close the popup when interacting with the year/month
  // <select> dropdowns from react-day-picker.
  useEffect(() => {
    if (!open) return;
    const popup = popupRef.current;
    if (!popup) return;
    const stop = (event: Event) => event.stopPropagation();
    popup.addEventListener("mousedown", stop);
    return () => popup.removeEventListener("mousedown", stop);
  }, [open]);

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const prevOpenRef = useRef(open);
  useEffect(() => {
    const prevOpen = prevOpenRef.current;
    prevOpenRef.current = open;
    if (prevOpen && !open) onCloseRef.current?.();
  }, [open]);

  const computeAndOpen = () => {
    if (disabled || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popupHeight = 380;
    const popupWidth = variant === "range" ? 620 : 340;
    const openTop =
      window.innerHeight - rect.bottom < popupHeight && rect.top > popupHeight;
    const overflowsRight = rect.left + popupWidth > window.innerWidth - 8;

    const verticalStyle: React.CSSProperties = openTop
      ? { transform: "translateY(-100%) translateY(-4px)" }
      : {};

    if (portalAnchor) {
      const anchorRect = portalAnchor.getBoundingClientRect();
      const top = openTop
        ? rect.top - anchorRect.top
        : rect.bottom - anchorRect.top + 4;
      const horizontal: React.CSSProperties = overflowsRight
        ? { right: anchorRect.right - rect.right }
        : { left: rect.left - anchorRect.left };
      setPopupStyle({ top, ...horizontal, ...verticalStyle });
    } else {
      const top = openTop ? rect.top : rect.bottom + 4;
      const horizontal: React.CSSProperties = overflowsRight
        ? { right: window.innerWidth - rect.right }
        : { left: rect.left };
      setPopupStyle({ top, ...horizontal, ...verticalStyle });
    }
    setOpen(true);
  };

  const handleSelectSingle = (date: Date | undefined) => {
    setInternalSingle(date);
    onChange?.(date);
    if (date) setOpen(false);
  };

  const applyRange = (range: DateRange) => {
    setInternalRange(range);
    onChange?.(range);
    setOpen(false);
  };

  // Two-click selection driven by `triggerDate`. We ignore react-day-picker's
  // auto-extension logic (addToRange), which would complete a range from a
  // single click whenever both endpoints are already set — that breaks the
  // expected "click start, click end" UX. The popup stays open after the
  // range is complete so the user can keep adjusting; consumers commit on
  // close via the `onClose` callback.
  const handleSelectRange = (
    _range: DateRange | undefined,
    triggerDate: Date | undefined
  ) => {
    if (!triggerDate) return;

    const hasPendingFrom = !!internalRange?.from && !internalRange.to;

    if (!hasPendingFrom) {
      setInternalRange({ from: triggerDate, to: undefined });
      return;
    }

    const from = internalRange!.from!;
    const isBackwards = triggerDate.getTime() < from.getTime();
    const completed: DateRange = {
      from: isBackwards ? triggerDate : from,
      to: isBackwards ? from : triggerDate,
    };
    setInternalRange(completed);
    onChange?.(completed);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (variant === "single") {
      setInternalSingle(undefined);
      onChange?.(null);
    } else {
      setInternalRange(undefined);
      onChange?.(null);
    }
  };

  // Format Display Text
  const formatDisplay = () => {
    if (variant === "single") {
      if (!internalSingle) return "";
      return format(internalSingle, "dd/MM/yyyy");
    } else {
      if (!internalRange?.from) return "";
      if (!internalRange.to) return format(internalRange.from, "dd/MM/yyyy");
      return `${format(internalRange.from, "dd/MM/yyyy")} - ${format(internalRange.to, "dd/MM/yyyy")}`;
    }
  };

  const hasValue =
    variant === "single" ? !!internalSingle : !!internalRange?.from;
  const displayValue = formatDisplay();

  const computedClasses = cn(
    inputStyles.controlBase,
    "flex items-center gap-[8px] cursor-pointer min-h-[36px]",
    inGroup ? inputStyles.controlGrouped : inputStyles.controlBordered,
    !inGroup && isError && inputStyles.error,
    !inGroup && isSuccess && inputStyles.success,
    className
  );

  return (
    <div
      ref={containerRef}
      className={computedClasses}
      onClick={computeAndOpen}
    >
      <div
        className={cn(
          "flex items-center justify-center pl-1 text-(--muted)",
          variant === "single" && "mr-1"
        )}
      >
        <CalendarIcon size={14} strokeWidth={3} />
      </div>

      <input
        {...props}
        readOnly
        id={context?.id}
        disabled={disabled}
        placeholder={
          placeholder ||
          (variant === "single" ? "Selecione a data" : "Selecione o período")
        }
        value={displayValue}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        className="pointer-events-none min-w-[50px] flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
      />

      {!disabledClear && hasValue && (
        <button
          type="button"
          className={cn(selectStyles.clearIcon, "pointer-events-auto")}
          onClick={handleClear}
          disabled={disabled}
        >
          <X size={14} strokeWidth={3} />
        </button>
      )}

      {open &&
        typeof document !== "undefined" &&
        ReactDOM.createPortal(
          <div
            ref={popupRef}
            style={{
              ...popupStyle,
              position: portalAnchor ? "absolute" : "fixed",
              zIndex: 9999,
            }}
            className={cn(calendarStyles.overlay, "w-auto min-w-max flex-row")}
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sidebar */}
            <div className={calendarStyles.sidebar}>
              {variant === "single"
                ? singleShortcuts.map((shortcut) => (
                    <button
                      key={shortcut.label}
                      type="button"
                      className={calendarStyles.sidebarButton}
                      onClick={() => handleSelectSingle(shortcut.getValue())}
                    >
                      {shortcut.label}
                    </button>
                  ))
                : rangeShortcuts.map((shortcut) => (
                    <button
                      key={shortcut.label}
                      type="button"
                      className={calendarStyles.sidebarButton}
                      onClick={() => applyRange(shortcut.getValue())}
                    >
                      {shortcut.label}
                    </button>
                  ))}
            </div>

            {/* Calendar */}
            <div className="bg-(--bg3) p-1">
              {variant === "single" ? (
                <CalendarBase
                  mode="single"
                  selected={internalSingle}
                  onSelect={handleSelectSingle}
                  defaultMonth={internalSingle}
                  initialFocus
                />
              ) : (
                <CalendarBase
                  mode="range"
                  selected={internalRange}
                  onSelect={handleSelectRange}
                  defaultMonth={internalRange?.from}
                  numberOfMonths={2}
                  initialFocus
                />
              )}
            </div>
          </div>,
          portalAnchor ?? document.body
        )}
    </div>
  );
};
