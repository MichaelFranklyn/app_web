"use client";

import { FilterField } from "@/components/Filters";
import { SelectOption } from "@/components/Input";
import { LocalField, useLocalTable } from "@/hooks/useLocalTable";
import { useMemo } from "react";
import { ClientVisit } from "../interface";
import { VISIT_OUTCOME_LABEL, VISIT_STATUS_LABEL } from "../utils";

/**
 * A data que a tabela mostra: o dia agendado, e o momento real só quando não há
 * agenda. Ordenar por outra coisa reordenaria por um valor que não está na tela.
 */
export const visitDate = (visit: ClientVisit): string | null =>
  visit.day?.date ?? visit.actualVisitAt ?? null;

const sellerName = (visit: ClientVisit): string | null =>
  visit.day?.schedule?.seller?.name ?? null;

/** Opções tiradas das próprias visitas — nenhuma escolha devolve lista vazia. */
const optionsFrom = (
  visits: ClientVisit[],
  read: (visit: ClientVisit) => { value: string; label: string } | null
): SelectOption[] => {
  const seen = new Map<string, string>();
  visits.forEach((visit) => {
    const entry = read(visit);
    if (entry && !seen.has(entry.value)) seen.set(entry.value, entry.label);
  });
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
};

const FIELDS: Record<string, LocalField<ClientVisit>> = {
  status: { type: "select", match: (visit, value) => visit.status === value },
  outcome: { type: "select", match: (visit, value) => visit.outcome === value },
  contactType: {
    type: "select",
    match: (visit, value) => visit.contactType === value,
  },
  sellerName: {
    type: "select",
    match: (visit, value) => sellerName(visit) === value,
  },
  // Período: as duas pontas são inclusivas e comparam ISO como texto, que é
  // ordenável byte a byte no formato yyyy-mm-dd.
  from: {
    type: "select",
    match: (visit, value) => (visitDate(visit) ?? "") >= value,
  },
  to: {
    type: "select",
    match: (visit, value) => (visitDate(visit) ?? "") <= value,
  },
};

const COLUMNS = {
  date: visitDate,
  seller: sellerName,
  status: (visit: ClientVisit) => VISIT_STATUS_LABEL[visit.status],
  outcome: (visit: ClientVisit) =>
    visit.outcome ? VISIT_OUTCOME_LABEL[visit.outcome] : null,
  outcomeReason: (visit: ClientVisit) => visit.outcomeReason,
};

export const useVisitsTable = (visits: ClientVisit[]) => {
  const table = useLocalTable<ClientVisit>({
    items: visits,
    columns: COLUMNS,
    fields: FIELDS,
  });

  const filterFields = useMemo<FilterField[]>(
    () => [
      { type: "date-range", key: "from", toKey: "to", label: "Período" },
      {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: "Todos os status",
        options: optionsFrom(visits, (visit) => ({
          value: visit.status,
          label: VISIT_STATUS_LABEL[visit.status] ?? visit.status,
        })),
      },
      {
        type: "select",
        key: "outcome",
        label: "Resultado",
        placeholder: "Todos os resultados",
        options: optionsFrom(visits, (visit) =>
          visit.outcome
            ? {
                value: visit.outcome,
                label: VISIT_OUTCOME_LABEL[visit.outcome] ?? visit.outcome,
              }
            : null
        ),
      },
      {
        type: "select",
        key: "contactType",
        label: "Tipo de contato",
        placeholder: "Presencial e remoto",
        options: optionsFrom(visits, (visit) => ({
          value: visit.contactType,
          label: visit.contactType === "REMOTE" ? "Remoto" : "Presencial",
        })),
      },
      {
        type: "select",
        key: "sellerName",
        label: "Vendedor",
        placeholder: "Todos os vendedores",
        options: optionsFrom(visits, (visit) => {
          const name = sellerName(visit);
          return name ? { value: name, label: name } : null;
        }),
      },
    ],
    [visits]
  );

  return { ...table, filterFields };
};
