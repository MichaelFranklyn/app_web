"use client";

import { Input, InputSearch, SelectOption } from "@/components/Input";
import { parseLocalDate, toIsoDate } from "@/utils/format/date";
import { DateRange } from "react-day-picker";
import { FilterField } from "./interface";

interface Props {
  field: FilterField;
  values: Record<string, string>;
  onChange: (patch: Record<string, string | undefined>) => void;
  /** Aplica uma chave só, com o debounce do campo (ver FiltersProps). */
  onTextChange?: (key: string, value: string | undefined) => void;
}

/** Renderiza UM campo do painel de filtros conforme o tipo declarado. */
export function FilterControl({
  field,
  values,
  onChange,
  onTextChange,
}: Props) {
  if (field.type === "text") {
    return (
      <InputSearch
        size="sm"
        label={field.label}
        placeholder={field.placeholder}
        value={values[field.key] ?? ""}
        onChange={(event) => {
          const value = event.target.value || undefined;
          if (onTextChange) onTextChange(field.key, value);
          else onChange({ [field.key]: value });
        }}
      />
    );
  }

  if (field.type === "select") {
    const selected =
      field.options.find((option) => option.value === values[field.key]) ??
      null;

    return (
      <Input.Select
        size="sm"
        label={field.label}
        options={field.options}
        value={selected}
        variant="single"
        placeholder={field.placeholder ?? "Todos"}
        onSearch={field.onSearch}
        loading={field.loading}
        onChange={(value: SelectOption | SelectOption[] | null) => {
          const option = Array.isArray(value) ? value[0] : value;
          onChange({ [field.key]: option?.value });
        }}
      />
    );
  }

  const hasRange = Boolean(values[field.key] || values[field.toKey]);
  const range: DateRange | null = hasRange
    ? {
        from: parseLocalDate(values[field.key]) ?? undefined,
        to: parseLocalDate(values[field.toKey]) ?? undefined,
      }
    : null;

  return (
    <Input.Date
      size="sm"
      variant="range"
      label={field.label}
      placeholder="Qualquer data"
      value={range}
      onChange={(value) => {
        // O calendário devolve um DateRange; limpar devolve null/undefined.
        const picked = value && "from" in value ? value : null;
        // toIsoDate (nunca .slice): o valor chega como Date no fuso local.
        onChange({
          [field.key]: toIsoDate(picked?.from) || undefined,
          [field.toKey]: toIsoDate(picked?.to) || undefined,
        });
      }}
    />
  );
}
