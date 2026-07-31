"use client";

import { Button } from "@/components/Button";
import { useAnchoredDropdown } from "@/hooks/useAnchoredDropdown";
import { SlidersHorizontal } from "lucide-react";
import { FilterPanel } from "./FilterPanel";
import { FiltersProps } from "./interface";
import { usePanelPosition } from "./usePanelPosition";
import { activeFilterCount, fieldKeys, visibleFields } from "./utils";

export type {
  FilterField,
  FilterFieldDateRange,
  FilterFieldSelect,
  FilterFieldText,
} from "./interface";

/**
 * Botão "Filtros" que abre um painel com os campos declarados em `fields`.
 *
 * Um botão só, em vez de vários seletores espalhados pelo cabeçalho: a tela
 * mostra quantos filtros estão valendo e, ao abrir, quais são — sem competir
 * por espaço com a busca e com as ações do card.
 *
 * Combina direto com `useTableData`: `values={inputValues}` e
 * `onChange={setFilters}`.
 */
// Os campos do painel abrem os próprios portais (dropdown do select, calendário
// do período). Clicar neles não pode fechar o painel que os contém.
const CHILD_PANELS = ["[data-select-dropdown]", "[data-date-popup]"];

export function Filters({
  fields,
  values,
  onChange,
  onTextChange,
  label = "Filtros",
  "data-tour": dataTour,
}: FiltersProps) {
  const { containerRef, floatingRef, open, setOpen, anchor, position } =
    useAnchoredDropdown(CHILD_PANELS);
  const { style, compute } = usePanelPosition(containerRef, anchor);

  const shown = visibleFields(fields);
  const count = activeFilterCount(fields, values);
  const portalTarget =
    anchor ?? (typeof document !== "undefined" ? document.body : null);

  const handleToggle = () => {
    if (open) {
      setOpen(false);
      return;
    }
    compute();
    setOpen(true);
  };

  // Limpa só os campos DESTE painel; a aba vigente e a ordenação continuam
  // valendo. Onde a busca por texto está no painel, ela é um campo como os
  // outros e "Limpar filtros" também a apaga — é o que se vê na tela.
  const handleClear = () =>
    onChange(
      Object.fromEntries(
        shown.flatMap(fieldKeys).map((key) => [key, undefined])
      )
    );

  return (
    <div
      ref={containerRef}
      className="relative inline-flex"
      data-tour={dataTour}
    >
      <Button.Root
        appearance={count > 0 ? "outline" : "ghost"}
        color="neutral"
        size="sm"
        noUppercase
        active={open}
        onClick={handleToggle}
      >
        <Button.Icon icon={SlidersHorizontal} />
        <Button.Title>{count > 0 ? `${label} (${count})` : label}</Button.Title>
      </Button.Root>

      {open && portalTarget && (
        <FilterPanel
          panelRef={floatingRef}
          position={position}
          style={style}
          portalTarget={portalTarget}
          fields={shown}
          values={values}
          onChange={onChange}
          onTextChange={onTextChange}
          onClear={handleClear}
          onClose={() => setOpen(false)}
          hasActiveFilters={count > 0}
        />
      )}
    </div>
  );
}
