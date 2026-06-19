"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { useModalPortal } from "@/components/Modal";
import { Title } from "@/components/Title";
import { cn } from "@/lib/utils";
import { ChevronDown, Plus, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { InputAddon } from "./Addon";
import { InputGroup } from "./Group";
import { InputHint } from "./Hint";
import { InputCheckbox } from "./InputCheckbox";
import { InputBaseProps } from "./InputText";
import { InputLabel } from "./Label";
import { InputRoot } from "./Root";
import { useInputContext } from "./context";
import { inputStyles, selectStyles } from "./styles";

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
  variant,
  onCreateOption,
  disabledClear,
  placeholder,
  ...props
}: InputSelectProps) => {
  const context = useInputContext();
  const modalPortal = useModalPortal();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const isError = context?.error;
  const isSuccess = context?.success;
  const inGroup = context?.inGroup;
  const disabled = context?.disabled || props.disabled;

  const [open, setOpen] = useState(false);
  const [multiValue, setMultiValue] = useState<SelectOption[]>(
    Array.isArray(value) ? value : []
  );
  const [singleValue, setSingleValue] = useState<SelectOption | null>(
    value && !Array.isArray(value) ? value : null
  );
  const [inputValue, setInputValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const filteredOptions = isSearching
    ? options.filter((opt: SelectOption) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    : options;

  useEffect(() => {
    if (variant === "multi" && Array.isArray(value)) {
      setMultiValue([...value]);
    } else if (
      variant === "single" &&
      value !== undefined &&
      !Array.isArray(value)
    ) {
      const normalized =
        value && typeof value === "object" && "label" in value ? value : null;
      setSingleValue(normalized);
      if (!isSearching) {
        setInputValue(normalized?.label ?? "");
      }
    }
  }, [value, variant, isSearching]);

  useEffect(() => {
    if (!open) {
      setIsSearching(false);
      if (variant === "multi") {
        setInputValue("");
      } else {
        setInputValue(singleValue ? singleValue.label : "");
      }
    }
  }, [open, variant, singleValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

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
  }, [open, modalPortal]);

  const handleSelectSingle = (option: SelectOption) => {
    onChange?.(option);
    setSingleValue(option);
    setInputValue(option.label);
    setOpen(false);
    setIsSearching(false);
  };

  const handleToggleOption = (option: SelectOption, clearInput = true) => {
    const isSelected = multiValue.some((v) => v.value === option.value);
    let newValue: SelectOption[];
    if (isSelected) {
      newValue = multiValue.filter((v) => v.value !== option.value);
    } else {
      newValue = [...multiValue, option];
    }
    setMultiValue(newValue);
    onChange?.(newValue);
    if (clearInput) setInputValue("");
    inputRef.current?.focus();
  };

  const handleRemoveMultiOption = (
    option: SelectOption,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    const newValue = multiValue.filter((v) => v.value !== option.value);
    setMultiValue(newValue);
    onChange?.(newValue);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (variant === "single") {
      onChange?.(null);
      setSingleValue(null);
    } else {
      onChange?.([]);
      setMultiValue([]);
    }
    setInputValue("");
    setIsSearching(false);
    inputRef.current?.focus();
  };

  const handleCreateNew = async () => {
    const valueToCreate = inputValue.trim();
    if (onCreateOption && valueToCreate) {
      const existingOption = options.find(
        (opt: SelectOption) =>
          opt.value.toLowerCase() === valueToCreate.toLowerCase()
      );
      if (existingOption) {
        if (variant === "single") handleSelectSingle(existingOption);
        else handleToggleOption(existingOption);
        return;
      }
      setIsCreating(true);
      try {
        const result = await onCreateOption(valueToCreate);
        const newOption: SelectOption =
          result && typeof result === "object" && "value" in result
            ? result
            : { label: valueToCreate, value: valueToCreate };

        if (variant === "single") handleSelectSingle(newOption);
        else handleToggleOption(newOption);

        if (variant === "single") setOpen(false);
        setInputValue("");
        setIsSearching(false);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allFilteredSelected =
      filteredOptions.length > 0 &&
      filteredOptions.every((opt: SelectOption) =>
        multiValue.some((v) => v.value === opt.value)
      );
    let newValue = [...multiValue];
    if (allFilteredSelected) {
      const filteredValuesSet = new Set(
        filteredOptions.map((opt: SelectOption) => opt.value)
      );
      newValue = multiValue.filter((v) => !filteredValuesSet.has(v.value));
    } else {
      const itemsToAdd = filteredOptions.filter(
        (opt: SelectOption) => !multiValue.some((v) => v.value === opt.value)
      );
      newValue = [...multiValue, ...itemsToAdd];
    }
    setMultiValue(newValue);
    onChange?.(newValue);
    setInputValue("");
    inputRef.current?.focus();
  };

  const isSelected = (option: SelectOption) => {
    if (variant === "single") return singleValue?.value === option.value;
    return multiValue.some((v) => v.value === option.value);
  };

  const areAllFilteredSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((opt: SelectOption) =>
      multiValue.some((v) => v.value === opt.value)
    );

  const hasValue = variant === "single" ? !!singleValue : multiValue.length > 0;
  const showCreateOption =
    onCreateOption &&
    !options.some(
      (opt: SelectOption) =>
        opt.label.toLowerCase() === inputValue.toLowerCase()
    );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      if (inputValue.trim()) handleCreateNew();
    }
    if (e.key === "Tab" && open && inputValue.trim()) {
      if (filteredOptions.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        const firstOption = filteredOptions[0];
        if (variant === "single") handleSelectSingle(firstOption);
        else handleToggleOption(firstOption);
      } else if (onCreateOption && showCreateOption) {
        e.preventDefault();
        e.stopPropagation();
        handleCreateNew();
      }
    }
  };

  const computedClasses = cn(
    inputStyles.controlBase,
    "flex items-center gap-[8px] cursor-text min-h-[36px]",
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
          multiValue.map((option) => (
            <Badge
              key={option.value}
              color="amber"
              appearance="solid"
              className="h-[22px] shrink-0 px-2 py-0"
            >
              <Badge.Text className="max-w-[120px] truncate text-[12px] font-medium">
                {option.label}
              </Badge.Text>
              <Badge.Icon
                onClick={(e) => handleRemoveMultiOption(option, e)}
                className="ml-1 cursor-pointer transition-colors hover:text-red-500"
              >
                <X size={12} strokeWidth={3} />
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
            variant === "multi" && multiValue.length > 0 ? "" : placeholder
          }
          value={inputValue}
          onKeyDown={handleKeyDown}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!isSearching) setIsSearching(true);
            if (!open) setOpen(true);
          }}
          className="min-w-[50px] flex-1 bg-transparent outline-none disabled:cursor-not-allowed"
        />
      </div>

      {!disabledClear && hasValue && (
        <button
          type="button"
          className={selectStyles.clearIcon}
          onClick={handleClear}
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

      {open &&
        dropdownPos &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            data-select-dropdown
            className={selectStyles.overlay}
            style={{
              position: modalPortal ? "absolute" : "fixed",
              top: dropdownPos.top,
              left: dropdownPos.left,
              width: dropdownPos.width,
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {variant === "multi" && filteredOptions.length > 0 && (
              <div
                className={selectStyles.optionBox}
                data-selected={areAllFilteredSelected}
                onClick={handleSelectAll}
              >
                <div className={selectStyles.optionCheckboxWrap}>
                  <InputCheckbox
                    checked={areAllFilteredSelected}
                    readOnly
                    tabIndex={-1}
                  />
                  <span className="font-medium">Selecionar todos</span>
                </div>
              </div>
            )}

            {filteredOptions.map((option: SelectOption) => (
              <div
                key={option.value}
                className={selectStyles.optionBox}
                data-selected={isSelected(option)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (variant === "single") handleSelectSingle(option);
                  else handleToggleOption(option);
                }}
              >
                <div className={selectStyles.optionCheckboxWrap}>
                  {variant === "multi" && (
                    <InputCheckbox
                      checked={isSelected(option)}
                      readOnly
                      tabIndex={-1}
                    />
                  )}
                  {option.startIcon && (
                    <div className="text-(--muted)">{option.startIcon}</div>
                  )}
                  <span className="truncate">{option.label}</span>
                  {option.endIcon && (
                    <div className="ml-auto text-(--muted)">
                      {option.endIcon}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredOptions.length === 0 && !showCreateOption && (
              <div className={selectStyles.warningText}>
                Nenhum resultado encontrado
              </div>
            )}

            {showCreateOption && (
              <div className="flex flex-col items-start gap-6 p-2">
                <Title variant="caption" color="muted" className="w-full">
                  Não encontrou o que procura?
                </Title>
                <Button.Root
                  type="button"
                  appearance="ghost"
                  color="neutral"
                  size="xs"
                  noUppercase
                  loading={isCreating}
                  disabled={inputValue.trim().length === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCreateNew();
                  }}
                >
                  <Button.Icon icon={Plus} />
                  <Button.Title>
                    {inputValue.trim().length > 0
                      ? `Criar "${inputValue}"`
                      : "Escreva e adicione"}
                  </Button.Title>
                </Button.Root>
              </div>
            )}
          </div>,
          modalPortal ?? document.body
        )}
    </div>
  );
};
