"use client";

import { FilterField } from "@/components/Filters";
import { LocalField } from "@/hooks/useLocalTable";
import { useMemo } from "react";

import { AbcRow } from "./interface";
import { ABC_CLASS_OPTIONS } from "./utils";

/**
 * O que cada campo do painel recorta na curva. A chave é a mesma do
 * `FilterField`; o `match` decide se a linha fica.
 *
 * Substituiu as abas de classe: filtro é um campo que se combina com a busca —
 * "os clientes da classe C que têm 'construção' no nome" — e aba não combina
 * com nada.
 */
export const ABC_FILTER_FIELDS: Record<string, LocalField<AbcRow>> = {
  search: {
    type: "text",
    match: (row, value) =>
      row.clientName.toLowerCase().includes(value.toLowerCase()),
  },
  abcClass: {
    type: "select",
    match: (row, value) => row.abcClass === value,
  },
};

/** Campos do painel: cliente e classe. */
export const useAbcFilters = (): FilterField[] =>
  useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: "Cliente",
        placeholder: "Nome do cliente",
      },
      {
        type: "select",
        key: "abcClass",
        label: "Classe",
        placeholder: "Todas as classes",
        options: ABC_CLASS_OPTIONS,
      },
    ],
    []
  );
