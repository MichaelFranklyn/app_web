"use client";

import { FilterField } from "@/components/Filters";
import { LocalField } from "@/hooks/useLocalTable";
import { useMemo } from "react";

import { optionsFromRows } from "../rowOptions";
import { FactoryOrdersRow } from "./interface";

/**
 * O que cada campo do painel recorta na lista de fábricas.
 *
 * "Só quem faturou" existe porque é a leitura que a aba entrega de mais útil: a
 * distância entre o que foi COLOCADO e o que a fábrica já FATUROU. Marcá-lo
 * mostra apenas as fábricas que já devolveram alguma coisa.
 */
export const FACTORIES_FILTER_FIELDS: Record<
  string,
  LocalField<FactoryOrdersRow>
> = {
  factoryId: {
    type: "select",
    match: (row, value) => row.entityId === value,
  },
  invoiced: {
    type: "select",
    match: (row, value) =>
      value === "yes"
        ? Number(row.invoicedAmount || 0) > 0
        : Number(row.invoicedAmount || 0) === 0,
  },
};

/** Campos do painel: fábrica e se já houve faturamento. */
export const useFactoriesFilters = (rows: FactoryOrdersRow[]): FilterField[] =>
  useMemo(
    () => [
      {
        type: "select",
        key: "factoryId",
        label: "Fábrica",
        placeholder: "Todas as fábricas",
        options: optionsFromRows(rows, (row) => ({
          value: row.entityId,
          label: row.entityName,
        })),
      },
      {
        type: "select",
        key: "invoiced",
        label: "Faturamento",
        placeholder: "Faturado ou não",
        options: [
          { value: "yes", label: "Já faturou algo" },
          { value: "no", label: "Nada faturado ainda" },
        ],
      },
    ],
    [rows]
  );
