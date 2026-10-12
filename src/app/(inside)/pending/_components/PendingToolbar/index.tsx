"use client";

import { FilterField, Filters } from "@/components/Filters";
import { Title } from "@/components/Title";

import { scopeNote } from "../../utils";

interface Props {
  filterFields: FilterField[];
  filterValues: Record<string, string>;
  setFilters: (patch: Record<string, string | undefined>) => void;
}

/**
 * O recorte da tela, escrito, e onde mudá-lo. A frase existe porque o padrão
 * não é óbvio: sem período, os cartões não contam "tudo" — contam o vencido e
 * a próxima semana.
 */
export function PendingToolbar({
  filterFields,
  filterValues,
  setFilters,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-8">
      <Title
        variant="body-sm"
        color="muted"
        className="min-w-0 flex-1"
        data-tour="pending-scope"
      >
        {scopeNote(filterValues)}
      </Title>
      <Filters
        fields={filterFields}
        values={filterValues}
        onChange={setFilters}
        data-tour="pending-filters"
      />
    </div>
  );
}
