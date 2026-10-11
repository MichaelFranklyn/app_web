import { RefObject, useEffect, useState } from "react";

import type { InputSelectProps, SelectOption } from "./InputSelect";
import { matchesSelectSearch } from "./selectFilter";

interface UseSelectStateArgs {
  options: SelectOption[];
  value: InputSelectProps["value"];
  onChange: InputSelectProps["onChange"];
  variant: "single" | "multi";
  onCreateOption: InputSelectProps["onCreateOption"];
  open: boolean;
  setOpen: (open: boolean) => void;
  inputRef: RefObject<HTMLInputElement | null>;
  /**
   * Busca server-side: quando presente, o filtro local é desligado (as `options`
   * já vêm filtradas do backend) e cada digitação chama `onSearch(termo)`. O
   * debounce mora no consumidor (ver `useAsyncSelectOptions`).
   */
  onSearch?: (term: string) => void;
}

/**
 * Só um `SelectOption` de verdade vira valor selecionado.
 *
 * O `value` chega de fora e nem sempre é uma opção: um formulário que guarda só
 * o id ("abc123") manda uma string. Aceitá-la como valor deixava `singleValue`
 * sem `label`, e o `inputValue` virava `undefined` — o React então acusava o
 * campo mudando de controlado para não controlado.
 */
const asOption = (value: InputSelectProps["value"]): SelectOption | null =>
  value &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  "label" in value
    ? value
    : null;

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
  onSearch,
}: UseSelectStateArgs) {
  const [multiValue, setMultiValue] = useState<SelectOption[]>(
    Array.isArray(value) ? value : []
  );
  const [singleValue, setSingleValue] = useState<SelectOption | null>(
    asOption(value)
  );
  const [inputValue, setInputValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  // Opção sob o teclado (índice em `filteredOptions`; -1 = nenhuma). O foco
  // continua no campo de texto: quem "anda" é só esta marca, anunciada ao
  // leitor de tela por `aria-activedescendant`.
  const [activeIndex, setActiveIndex] = useState(-1);

  const isAsync = !!onSearch;

  // Modo assíncrono: as opções já vêm filtradas do backend → não filtra local.
  const filteredOptions =
    isAsync || !isSearching
      ? options
      : options.filter((opt) => matchesSelectSearch(opt, inputValue));

  // Modo assíncrono: repassa o termo digitado ao backend (o debounce mora no
  // consumidor). Só dispara enquanto o usuário está buscando ativamente, para
  // não refazer o fetch ao apenas sincronizar o rótulo do valor selecionado.
  useEffect(() => {
    if (isAsync && isSearching) onSearch?.(inputValue);
  }, [isAsync, isSearching, inputValue, onSearch]);

  // Sincroniza o valor interno com o `value` controlado que chega de fora.
  useEffect(() => {
    if (variant === "multi" && Array.isArray(value)) {
      setMultiValue([...value]);
    } else if (
      variant === "single" &&
      value !== undefined &&
      !Array.isArray(value)
    ) {
      const normalized = asOption(value);
      setSingleValue(normalized);
      if (!isSearching) {
        setInputValue(normalized?.label ?? "");
      }
    }
  }, [value, variant, isSearching]);

  // A marca do teclado não sobrevive a uma lista que mudou: o índice apontaria
  // para outra opção. Fechou ou filtrou, volta ao começo.
  useEffect(() => {
    setActiveIndex(-1);
  }, [open, inputValue, options.length]);

  // Ao fechar, encerra a busca e restaura o texto para o rótulo selecionado.
  useEffect(() => {
    if (!open) {
      setIsSearching(false);
      if (variant === "multi") {
        setInputValue("");
      } else {
        setInputValue(singleValue?.label ?? "");
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

  const chooseOption = (option: SelectOption) => {
    if (variant === "single") handleSelectSingle(option);
    else handleToggleOption(option);
  };

  /** Anda a marca do teclado, dando a volta nas pontas. */
  const moveActive = (step: 1 | -1) => {
    const last = filteredOptions.length - 1;
    if (last < 0) return;
    setActiveIndex((current) => {
      // Primeira seta numa lista recém-aberta: parte da opção já escolhida.
      if (current < 0) {
        const selected = filteredOptions.findIndex(isSelected);
        if (selected >= 0) return selected;
        return step === 1 ? 0 : last;
      }
      const next = current + step;
      if (next > last) return 0;
      if (next < 0) return last;
      return next;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      // Sem isto a seta move o cursor dentro do texto e a página rola.
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      moveActive(e.key === "ArrowDown" ? 1 : -1);
      return;
    }
    if (open && (e.key === "Home" || e.key === "End")) {
      if (filteredOptions.length === 0) return;
      e.preventDefault();
      setActiveIndex(e.key === "Home" ? 0 : filteredOptions.length - 1);
      return;
    }
    if (e.key === "Escape" && open) {
      // Fecha SÓ a lista. Sem segurar o evento, o Escape subia até o Modal e
      // fechava o formulário inteiro com o que a pessoa já tinha preenchido.
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      return;
    }
    // Multi: com o campo vazio, Backspace tira a última escolha — o "x" de
    // cada etiqueta só responde ao mouse.
    if (
      e.key === "Backspace" &&
      variant === "multi" &&
      !inputValue &&
      multiValue.length > 0
    ) {
      const newValue = multiValue.slice(0, -1);
      setMultiValue(newValue);
      onChange?.(newValue);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      const active = open ? filteredOptions[activeIndex] : undefined;
      if (active) chooseOption(active);
      else if (inputValue.trim()) handleCreateNew();
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
    activeIndex,
    setActiveIndex,
  };
}
