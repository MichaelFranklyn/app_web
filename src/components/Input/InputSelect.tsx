"use client";

import { Badge } from "@/components/Badges";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { InputAddon } from "./Addon";
import { InputGroup } from "./Group";
import { InputHint } from "./Hint";
import { InputBaseProps } from "./InputText";
import { InputLabel } from "./Label";
import { InputRoot } from "./Root";
import { SelectDropdown } from "./SelectDropdown";
import { useInputContext } from "./context";
import {
  inputSizeMinHeight,
  inputSizePadding,
  inputStyles,
  selectStyles,
} from "./styles";
import { useAnchoredDropdown } from "./useAnchoredDropdown";
import { useSelectState } from "./useSelectState";

export type SelectOption = {
  value: string;
  label: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  [key: string]: unknown;
};

export interface InputSelectProps extends Omit<
  InputBaseProps,
  "value" | "onChange" | "defaultValue"
> {
  options: SelectOption[];
  value?: SelectOption | SelectOption[] | null;
  onChange?: (val: SelectOption | SelectOption[] | null) => void;
  variant?: "single" | "multi";
  onCreateOption?: (val: string) => Promise<SelectOption | null> | void;
  disabledClear?: boolean;
}

export const InputSelect = ({
  label,
  hint,
  error,
  success,
  addon,
  className,
  containerClassName,
  options,
  value,
  onChange,
  variant = "single",
  onCreateOption,
  disabledClear = false,
  placeholder,
  size,
  ...props
}: InputSelectProps) => {
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
          <InputSelectControl
            className={className}
            options={options}
            value={value}
            onChange={onChange}
            variant={variant}
            onCreateOption={onCreateOption}
            disabledClear={disabledClear}
            placeholder={placeholder}
            {...props}
          />
        </InputGroup>
      ) : (
        <div className="relative w-full">
          <InputSelectControl
            className={className}
            options={options}
            value={value}
            onChange={onChange}
            variant={variant}
            onCreateOption={onCreateOption}
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

const InputSelectControl = ({
  className,
  options,
  value,
  onChange,
  variant = "single",
  onCreateOption,
  disabledClear,
  placeholder,
  ...props
}: Omit<InputSelectProps, "size">) => {
  const context = useInputContext();
  const {
    containerRef,
    floatingRef: dropdownRef,
    open,
    setOpen,
    anchor: modalPortal,
    position,
  } = useAnchoredDropdown();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const isError = context?.error;
  const isSuccess = context?.success;
  const inGroup = context?.inGroup;
  const disabled = context?.disabled || props.disabled;

  const select = useSelectState({
    options,
    value,
    onChange,
    variant,
    onCreateOption,
    open,
    setOpen,
    inputRef,
  });

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const updatePos = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (modalPortal) {
        // Dentro do Modal: Dialog.Content tem transform, então position:fixed fica relativo a ele.
        // Usamos position:absolute no portalEl (inset-0) → coordenadas relativas ao Dialog.Content.
        const origin = modalPortal.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom - origin.top + 4,
          left: rect.left - origin.left,
          width: rect.width,
        });
      } else {
        setDropdownPos({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    };
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, modalPortal, containerRef]);

  const size = context?.size ?? "md";

  const computedClasses = cn(
    inputStyles.controlBase,
    inputSizePadding[size],
    !inGroup && inputSizeMinHeight[size],
    "flex items-center gap-[8px] cursor-text",
    inGroup ? inputStyles.controlGrouped : inputStyles.controlBordered,
    !inGroup && isError && inputStyles.error,
    !inGroup && isSuccess && inputStyles.success,
    className
  );

  return (
    <div
      ref={containerRef}
      className={computedClasses}
      onClick={() => !disabled && setOpen(true)}
    >
      <div className={selectStyles.inputFlex}>
        {variant === "multi" &&
          select.multiValue.map((option) => (
            <Badge
              key={option.value}
              color="amber"
              appearance="solid"
              className="h-[26px] shrink-0 gap-1 py-0 pr-[6px] pl-[10px]"
            >
              <Badge.Text className="max-w-[220px] truncate text-[13px] font-medium">
                {option.label}
              </Badge.Text>
              <Badge.Icon
                onClick={(e) => select.handleRemoveMultiOption(option, e)}
                className="ml-[2px] flex size-[18px] cursor-pointer items-center justify-center rounded-full transition-colors hover:bg-black/20 [&>svg]:!size-3.5"
              >
                <X size={14} strokeWidth={2.5} />
              </Badge.Icon>
            </Badge>
          ))}

        <input
          {...props}
          id={context?.id}
          ref={inputRef}
          type="text"
          disabled={disabled}
          placeholder={
            variant === "multi" && select.multiValue.length > 0
              ? ""
              : placeholder
          }
          value={select.inputValue}
          onKeyDown={select.handleKeyDown}
          onChange={(e) => {
            select.setInputValue(e.target.value);
            if (!select.isSearching) select.setIsSearching(true);
            if (!open) setOpen(true);
          }}
          className="min-w-[50px] flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
        />
      </div>

      {!disabledClear && select.hasValue && (
        <button
          type="button"
          className={selectStyles.clearIcon}
          onClick={select.handleClear}
          disabled={disabled}
        >
          <X size={14} strokeWidth={3} />
        </button>
      )}

      <div
        className={cn(selectStyles.dropdownIcon, open && "rotate-180")}
        onClick={(e) => {
          e.stopPropagation();
          if (!disabled) {
            setOpen(!open);
            inputRef.current?.focus();
          }
        }}
      >
        <ChevronDown size={14} strokeWidth={3} />
      </div>

      {open && dropdownPos && typeof window !== "undefined" && (
        <SelectDropdown
          dropdownRef={dropdownRef}
          position={position}
          pos={dropdownPos}
          portalTarget={modalPortal ?? document.body}
          variant={variant}
          options={select.filteredOptions}
          isSelected={select.isSelected}
          areAllFilteredSelected={select.areAllFilteredSelected}
          onSelectAll={select.handleSelectAll}
          onSelectOption={(option, e) => {
            e.stopPropagation();
            if (variant === "single") select.handleSelectSingle(option);
            else select.handleToggleOption(option);
          }}
          showCreateOption={select.showCreateOption}
          inputValue={select.inputValue}
          isCreating={select.isCreating}
          onCreateNew={(e) => {
            e.stopPropagation();
            select.handleCreateNew();
          }}
        />
      )}
    </div>
  );
};
