"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { RefObject } from "react";
import { createPortal } from "react-dom";
import { FilterControl } from "./FilterControl";
import { FilterField } from "./interface";

interface Props {
  panelRef: RefObject<HTMLDivElement | null>;
  position: "absolute" | "fixed";
  style: React.CSSProperties;
  portalTarget: Element;
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (patch: Record<string, string | undefined>) => void;
  onTextChange?: (key: string, value: string | undefined) => void;
  onClear: () => void;
  onClose: () => void;
  hasActiveFilters: boolean;
}

/**
 * Painel flutuante com os campos de filtro.
 *
 * Vai para um portal porque o card da tabela tem `overflow-hidden` — ancorado
 * ali dentro, o painel seria cortado na primeira linha.
 *
 * Não há botão "Aplicar": cada campo já vale ao ser escolhido (a lista reage na
 * hora), como no seletor de vendedor das outras telas. O rodapé serve para
 * desfazer tudo de uma vez e para fechar.
 */
export function FilterPanel({
  panelRef,
  position,
  style,
  portalTarget,
  fields,
  values,
  onChange,
  onTextChange,
  onClear,
  onClose,
  hasActiveFilters,
}: Props) {
  return createPortal(
    <div
      ref={panelRef}
      data-filters-panel
      className="z-[9998] flex w-[320px] flex-col gap-16 rounded-(--r-md) border border-(--border) bg-(--bg2) p-16 shadow-lg"
      style={{ position, ...style }}
    >
      <Title variant="label" color="muted">
        Filtrar por
      </Title>

      <div className="flex flex-col gap-12">
        {fields.map((field) => (
          <FilterControl
            key={field.key}
            field={field}
            values={values}
            onChange={onChange}
            onTextChange={onTextChange}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-8">
        <Button.Root
          appearance="ghost"
          color="neutral"
          size="sm"
          noUppercase
          disabled={!hasActiveFilters}
          onClick={onClear}
        >
          <Button.Title>Limpar filtros</Button.Title>
        </Button.Root>

        <Button.Root
          appearance="outline"
          color="neutral"
          size="sm"
          noUppercase
          onClick={onClose}
        >
          <Button.Title>Fechar</Button.Title>
        </Button.Root>
      </div>
    </div>,
    portalTarget
  );
}
