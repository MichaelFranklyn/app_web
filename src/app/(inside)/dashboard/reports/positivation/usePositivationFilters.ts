"use client";

import { FilterField } from "@/components/Filters";
import { LocalField } from "@/hooks/useLocalTable";
import { useMemo } from "react";

import { optionsFromRows } from "../rowOptions";
import { PositivationRow } from "./interface";

/**
 * O que cada campo do painel recorta na matriz.
 *
 * "Zerados" é o recorte que faz o relatório valer a viagem — quem está na
 * carteira e não comprou nada no período —, e como campo do painel ele passa a
 * se combinar com a fábrica e o vendedor: "os zerados do Orlando".
 */
export const POSITIVATION_FILTER_FIELDS: Record<
  string,
  LocalField<PositivationRow>
> = {
  search: {
    type: "text",
    match: (row, value) =>
      row.clientName.toLowerCase().includes(value.toLowerCase()),
  },
  sellerId: {
    type: "select",
    match: (row, value) => row.sellerId === value,
  },
  positivated: {
    type: "select",
    match: (row, value) =>
      value === "yes"
        ? row.positivatedFactories > 0
        : row.positivatedFactories === 0,
  },
  factoryId: {
    type: "select",
    // Recorta pela CÉLULA: o cliente fica se comprou daquela fábrica no
    // período. É a pergunta que a matriz não responde de relance quando há
    // muitas colunas — "quem comprou da Delta?".
    match: (row, value) =>
      row.cells.some((cell) => cell.factoryId === value && cell.isPositivated),
  },
};

/** Campos do painel: cliente, vendedor, positivação e fábrica. */
export const usePositivationFilters = (
  rows: PositivationRow[],
  factories: { factoryId: string; factoryName: string }[]
): FilterField[] =>
  useMemo(() => {
    const sellers = optionsFromRows(rows, (row) =>
      row.sellerId ? { value: row.sellerId, label: row.sellerName } : null
    );

    return [
      {
        type: "text",
        key: "search",
        label: "Cliente",
        placeholder: "Nome do cliente",
      },
      {
        type: "select",
        key: "positivated",
        label: "Positivação",
        placeholder: "Positivaram ou não",
        options: [
          { value: "no", label: "Zerados (não compraram)" },
          { value: "yes", label: "Positivaram" },
        ],
      },
      {
        type: "select",
        key: "factoryId",
        label: "Comprou da fábrica",
        placeholder: "Qualquer fábrica",
        options: factories.map((factory) => ({
          value: factory.factoryId,
          label: factory.factoryName,
        })),
        hidden: factories.length < 2,
      },
      {
        type: "select",
        key: "sellerId",
        label: "Vendedor",
        placeholder: "Todos os vendedores",
        options: sellers,
        hidden: sellers.length < 2,
      },
    ];
  }, [rows, factories]);
