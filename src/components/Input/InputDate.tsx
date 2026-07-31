"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { InputRoot } from "./Root";
import { InputLabel } from "./Label";
import { InputHint } from "./Hint";
import { InputGroup } from "./Group";
import { InputAddon } from "./Addon";
import { useInputContext } from "./context";
import {
  inputSizeMinHeight,
  inputSizePadding,
  inputStyles,
  selectStyles,
} from "./styles";
import { InputBaseProps } from "./InputText";
import { DatePopup } from "./DatePopup";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useAnchoredDropdown } from "@/hooks/useAnchoredDropdown";
import { useDateSelection } from "./useDateSelection";

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
  size,
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
      size={size}
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
}: Omit<InputDateProps, "size">) => {
  const context = useInputContext();
  const {
    containerRef,
    floatingRef: popupRef,
    open,
    setOpen,
    anchor: portalAnchor,
    position,
  } = useAnchoredDropdown();

  const disabled = context?.disabled || props.disabled;
  const isError = context?.error;
  const isSuccess = context?.success;
  const inGroup = context?.inGroup;
  const size = context?.size ?? "md";

  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  const dateSel = useDateSelection({
    value,
    variant: variant ?? "single",
    onChange,
    open,
    setOpen,
  });

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
  }, [open, popupRef]);

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

  const computedClasses = cn(
    inputStyles.controlBase,
    inputSizePadding[size],
    !inGroup && inputSizeMinHeight[size],
    "flex items-center gap-[8px] cursor-pointer",
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
        value={dateSel.displayValue}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
        className="pointer-events-none min-w-[50px] flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
      />

      {!disabledClear && dateSel.hasValue && (
        <button
          type="button"
          className={cn(selectStyles.clearIcon, "pointer-events-auto")}
          onClick={dateSel.handleClear}
          disabled={disabled}
        >
          <X size={14} strokeWidth={3} />
        </button>
      )}

      {open && typeof document !== "undefined" && (
        <DatePopup
          popupRef={popupRef}
          style={popupStyle}
          position={position}
          portalTarget={portalAnchor ?? document.body}
          variant={variant ?? "single"}
          internalSingle={dateSel.internalSingle}
          internalRange={dateSel.internalRange}
          onSelectSingle={dateSel.handleSelectSingle}
          onApplyRange={dateSel.applyRange}
          onSelectRange={dateSel.handleSelectRange}
        />
      )}
    </div>
  );
};
