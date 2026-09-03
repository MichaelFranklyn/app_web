"use client";

import { FilterField } from "@/components/Filters";
import { SelectOption } from "@/components/Input";
import { LocalField, useLocalTable } from "@/hooks/useLocalTable";
import { factoryName } from "@/utils/company";
import { useMemo } from "react";

import { ClientProductAnalysisRow } from "./interface";
import { presenceShare, STATUS_LABEL } from "./utils";

/** Opções tiradas das próprias linhas — nenhuma escolha devolve lista vazia. */
const optionsFrom = (
  rows: ClientProductAnalysisRow[],
  read: (
    row: ClientProductAnalysisRow
  ) => { value: string; label: string } | null
): SelectOption[] => {
  const seen = new Map<string, string>();
  rows.forEach((row) => {
    const entry = read(row);
    if (entry && !seen.has(entry.value)) seen.set(entry.value, entry.label);
  });
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
};

const FIELDS: Record<string, LocalField<ClientProductAnalysisRow>> = {
  status: { type: "select", match: (row, value) => row.status === value },
  factoryId: { type: "select", match: (row, value) => row.factoryId === value },
  search: {
    type: "text",
    match: (row, value) => {
      const term = value.toLowerCase();
      return (
        (row.product?.name ?? "").toLowerCase().includes(term) ||
        (row.product?.sku ?? "").toLowerCase().includes(term)
      );
    },
  },
};

const COLUMNS = {
  product: (row: ClientProductAnalysisRow) => row.product?.name ?? null,
  factory: (row: ClientProductAnalysisRow) => factoryName(row.factory),
  presence: presenceShare,
  lastPurchase: (row: ClientProductAnalysisRow) => row.lastPurchaseDate,
  cycle: (row: ClientProductAnalysisRow) => row.avgIntervalDays,
  expected: (row: ClientProductAnalysisRow) => row.expectedNextDate,
  status: (row: ClientProductAnalysisRow) => STATUS_LABEL[row.status],
  amount: (row: ClientProductAnalysisRow) => Number(row.totalAmount),
};

/**
 * Ordenação e filtro em memória: a análise vem inteira do servidor (é de um
 * cliente só) e três das colunas — presença, ciclo e situação — são derivadas,
 * então não existem como coluna para o banco ordenar.
 */
export const useProductAnalysisTable = (rows: ClientProductAnalysisRow[]) => {
  const table = useLocalTable<ClientProductAnalysisRow>({
    items: rows,
    columns: COLUMNS,
    fields: FIELDS,
  });

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        key: "search",
        label: "Produto",
        placeholder: "Nome ou código",
      },
      {
        type: "select",
        key: "status",
        label: "Situação",
        placeholder: "Todas as situações",
        options: optionsFrom(rows, (row) => ({
          value: row.status,
          label: STATUS_LABEL[row.status],
        })),
      },
      {
        type: "select",
        key: "factoryId",
        label: "Fábrica",
        placeholder: "Todas as fábricas",
        options: optionsFrom(rows, (row) => ({
          value: row.factoryId,
          label: factoryName(row.factory),
        })),
      },
    ],
    [rows]
  );

  return { ...table, filterFields };
};
