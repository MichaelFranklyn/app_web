import { RefObject, useEffect, useState } from "react";

import type { InputSelectProps, SelectOption } from "./InputSelect";

interface UseSelectStateArgs {
  options: SelectOption[];
  value: InputSelectProps["value"];
  onChange: InputSelectProps["onChange"];
  variant: "single" | "multi";
  onCreateOption: InputSelectProps["onCreateOption"];
  open: boolean;
  setOpen: (open: boolean) => void;
  inputRef: RefObject<HTMLInputElement | null>;
}

/**
 * Estado e comportamento de seleção do InputSelect (single/multi): valor
 * interno, texto de busca, filtro, criação de opção e as regras de teclado.
 * Sincroniza com o `value` controlado e delega posicionamento/portais ao
 * componente — aqui mora só a lógica de "o que está selecionado e por quê".
 */
export function useSelectState({
  options,
  value,
  onChange,
  variant,
  onCreateOption,
  open,
  setOpen,
  inputRef,
}: UseSelectStateArgs) {
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
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    : options;

  // Sincroniza o valor interno com o `value` controlado que chega de fora.
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

  // Ao fechar, encerra a busca e restaura o texto para o rótulo selecionado.
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

  const handleSelectSingle = (option: SelectOption) => {
    onChange?.(option);
    setSingleValue(option);
    setInputValue(option.label);
    setOpen(false);
    setIsSearching(false);
  };

  const handleToggleOption = (option: SelectOption, clearInput = true) => {
    const isSelected = multiValue.some((v) => v.value === option.value);
    const newValue = isSelected
      ? multiValue.filter((v) => v.value !== option.value)
      : [...multiValue, option];
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
    if (!onCreateOption || !valueToCreate) return;
    const existingOption = options.find(
      (opt) => opt.value.toLowerCase() === valueToCreate.toLowerCase()
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
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allFilteredSelected =
      filteredOptions.length > 0 &&
      filteredOptions.every((opt) =>
        multiValue.some((v) => v.value === opt.value)
      );
    let newValue: SelectOption[];
    if (allFilteredSelected) {
      const filteredValuesSet = new Set(
        filteredOptions.map((opt) => opt.value)
      );
      newValue = multiValue.filter((v) => !filteredValuesSet.has(v.value));
    } else {
      const itemsToAdd = filteredOptions.filter(
        (opt) => !multiValue.some((v) => v.value === opt.value)
      );
      newValue = [...multiValue, ...itemsToAdd];
    }
    setMultiValue(newValue);
    onChange?.(newValue);
    setInputValue("");
    inputRef.current?.focus();
  };

  const isSelected = (option: SelectOption) =>
    variant === "single"
      ? singleValue?.value === option.value
      : multiValue.some((v) => v.value === option.value);

  const areAllFilteredSelected =
    filteredOptions.length > 0 &&
    filteredOptions.every((opt) =>
      multiValue.some((v) => v.value === opt.value)
    );

  const hasValue = variant === "single" ? !!singleValue : multiValue.length > 0;
  const showCreateOption =
    !!onCreateOption &&
    !options.some(
      (opt) => opt.label.toLowerCase() === inputValue.toLowerCase()
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

  return {
    multiValue,
    inputValue,
    setInputValue,
    isSearching,
    setIsSearching,
    isCreating,
    filteredOptions,
    handleSelectSingle,
    handleToggleOption,
    handleRemoveMultiOption,
    handleClear,
    handleCreateNew,
    handleSelectAll,
    isSelected,
    areAllFilteredSelected,
    hasValue,
    showCreateOption,
    handleKeyDown,
  };
}
