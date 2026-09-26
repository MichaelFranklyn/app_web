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
  inputSizeText,
  inputStyles,
  selectStyles,
} from "./styles";
import { useAnchoredDropdown } from "@/hooks/useAnchoredDropdown";
import { useSelectState } from "./useSelectState";

export type SelectOption = {
  value: string;
  label: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  /**
   * Texto extra considerado pelo filtro local, além do rótulo. Use para dados
   * pelos quais o usuário busca mas que não cabem no rótulo (ex.: razão social
   * quando o rótulo mostra o nome fantasia).
   */
  searchText?: string;
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
  /**
   * Busca server-side: desliga o filtro local e chama `onSearch(termo)` a cada
   * digitação (debounce no consumidor — ver `useAsyncSelectOptions`).
   */
  onSearch?: (term: string) => void;
  /** Indicador de carregamento das opções (usado no modo assíncrono). */
  loading?: boolean;
  /**
   * Formulário nativo (Server Action / `FormData`): envia o VALOR da opção num
   * campo oculto com este nome. Sem isso, o `name` cairia na caixa de busca e o
   * formulário mandaria o rótulo digitado ("Visitei"), não o valor ("VISITED").
   */
  name?: string;
  /**
   * `false` para listas curtas: a caixa vira só leitura e tocar nela abre a
   * lista SEM abrir o teclado do celular — que, para escolher entre cinco
   * opções, só cobriria metade da tela.
   */
  searchable?: boolean;
  /** Valor inicial quando o campo não é controlado (sem `value`). */
  defaultValue?: SelectOption | SelectOption[] | null;
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
  required,
  onSearch,
  loading,
  name,
  defaultValue,
  ...props
}: InputSelectProps) => {
  const [uncontrolled, setUncontrolled] = useState<InputSelectProps["value"]>(
    defaultValue ?? null
  );
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : uncontrolled;
  const handleChange: InputSelectProps["onChange"] = (next) => {
    if (!isControlled) setUncontrolled(next);
    onChange?.(next);
  };
  const submittedValues = (
    Array.isArray(currentValue) ? currentValue : [currentValue]
  ).filter((option): option is SelectOption => !!option);

  const isError = !!error;
  const hintMessage = typeof error === "string" ? error : hint;

  return (
    <InputRoot
      error={isError}
      success={success}
      disabled={props.disabled}
      className={containerClassName}
      size={size}
      required={required}
      id={props.id}
    >
      {label && <InputLabel>{label}</InputLabel>}

      {addon ? (
        <InputGroup className="relative overflow-visible">
          <InputAddon>{addon}</InputAddon>
          <InputSelectControl
            className={className}
            options={options}
            value={currentValue}
            onChange={handleChange}
            variant={variant}
            onCreateOption={onCreateOption}
            disabledClear={disabledClear}
            placeholder={placeholder}
            onSearch={onSearch}
            loading={loading}
            {...props}
          />
        </InputGroup>
      ) : (
        <div className="relative w-full">
          <InputSelectControl
            className={className}
            options={options}
            value={currentValue}
            onChange={handleChange}
            variant={variant}
            onCreateOption={onCreateOption}
            disabledClear={disabledClear}
            placeholder={placeholder}
            onSearch={onSearch}
            loading={loading}
            {...props}
          />
        </div>
      )}

      {name
        ? (submittedValues.length > 0 ? submittedValues : [null]).map(
            (option, index) => (
              <input
                key={option?.value ?? index}
                type="hidden"
                name={name}
                value={option?.value ?? ""}
              />
            )
          )
        : null}

      {hintMessage && <InputHint>{hintMessage}</InputHint>}
    </InputRoot>
  );
};

// Espelha o `max-h-[240px]` de `selectStyles.overlay`: é a altura máxima que a
// lista pode ocupar, e é por ela que se decide se há espaço abaixo do campo.
const DROPDOWN_MAX_HEIGHT = 240;

const InputSelectControl = ({
  className,
  options,
  value,
  onChange,
  variant = "single",
  onCreateOption,
  disabledClear,
  placeholder,
  onSearch,
  loading,
  searchable = true,
  ...props
}: Omit<InputSelectProps, "size" | "name" | "defaultValue">) => {
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
    openTop: boolean;
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
    onSearch,
  });

  useEffect(() => {
    if (!open || !containerRef.current) return;
    const updatePos = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Sem espaço abaixo, a lista abre para cima — e só se couber lá. O painel
      // é `fixed`/`absolute` num portal: passando do rodapé da janela ele fica
      // simplesmente inalcançável, porque rolar a página não o traz de volta.
      // Aparecia nos campos de baixo do painel de filtros.
      const openTop =
        window.innerHeight - rect.bottom < DROPDOWN_MAX_HEIGHT &&
        rect.top > DROPDOWN_MAX_HEIGHT;

      if (modalPortal) {
        // Dentro do Modal: Dialog.Content tem transform, então position:fixed fica relativo a ele.
        // Usamos position:absolute no portalEl (inset-0) → coordenadas relativas ao Dialog.Content.
        const origin = modalPortal.getBoundingClientRect();
        setDropdownPos({
          top: openTop ? rect.top - origin.top : rect.bottom - origin.top + 4,
          left: rect.left - origin.left,
          width: rect.width,
          openTop,
        });
      } else {
        setDropdownPos({
          top: openTop ? rect.top : rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          openTop,
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
    inputSizeText[size],
    !inGroup && inputSizeMinHeight[size],
    "flex items-center gap-[8px]",
    searchable ? "cursor-text" : "cursor-pointer",
    // Travado tem de PARECER travado: o clique já era ignorado, mas o campo
    // continuava com a mesma cara de um editável, e quem tentava escolher não
    // entendia por que nada acontecia.
    disabled && "cursor-not-allowed opacity-60",
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
          readOnly={!searchable}
          inputMode={searchable ? undefined : "none"}
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
          className={cn(
            "min-w-[50px] flex-1 bg-transparent outline-none disabled:cursor-not-allowed",
            !searchable && "cursor-pointer caret-transparent"
          )}
        />
      </div>

      {!disabledClear && select.hasValue && (
        <button
          type="button"
          aria-label="Limpar"
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
          loading={loading}
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
