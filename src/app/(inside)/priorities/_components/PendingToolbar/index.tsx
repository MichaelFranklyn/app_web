"use client";

import { FilterField, Filters } from "@/components/Filters";
import { Alert } from "@/components/Alert";
import { CalendarRange } from "lucide-react";

import { scopeNote } from "../../utils";

interface Props {
  filterFields: FilterField[];
  filterValues: Record<string, string>;
  setFilters: (patch: Record<string, string | undefined>) => void;
  /** Pendências somadas nos cartões, anunciadas ao leitor de tela ao filtrar. */
  resultCount: number;
  resultLoading: boolean;
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
  resultCount,
  resultLoading,
}: Props) {
  return (
    <div
      // Abaixo do desktop: a nota na linha inteira e "Filtros" esticado embaixo.
      className="desktop:flex-row desktop:items-center desktop:justify-between flex flex-col gap-8"
    >
      {/* Neutro, não informativo: a nota acompanha o filtro e fica logo abaixo
          do aviso azul da aba — dois azuis seguidos competiriam (14/11/2026). */}
      <Alert.Root
        variant="neutral"
        size="sm"
        role="note"
        className="min-w-0 flex-1"
        data-tour="pending-scope"
      >
        <Alert.Icon icon={CalendarRange} muted />
        <Alert.Content>
          <Alert.Title>Período dos cartões</Alert.Title>
          <Alert.Description>{scopeNote(filterValues)}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
      <Filters
        fields={filterFields}
        values={filterValues}
        onChange={setFilters}
        resultCount={resultCount}
        resultLoading={resultLoading}
        data-tour="pending-filters"
        fullWidthBelowDesktop
      />
    </div>
  );
}
