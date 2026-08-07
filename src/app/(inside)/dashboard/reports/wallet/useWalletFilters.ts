"use client";

import { FilterField } from "@/components/Filters";
import { LocalField } from "@/hooks/useLocalTable";
import { useMemo } from "react";

import { optionsFromRows } from "../rowOptions";
import { SITUATION_LABEL, SITUATION_ORDER } from "../situation";
import { WalletRow } from "./interface";

/**
 * O que cada campo do painel recorta na carteira. A chave é a mesma do
 * `FilterField`; o `match` decide se a linha fica.
 *
 * Substituiu as abas de situação: os recortes se COMBINAM ("os parados da
 * Bahia"), e aba só sabe mostrar um de cada vez.
 */
export const WALLET_FILTER_FIELDS: Record<string, LocalField<WalletRow>> = {
  search: {
    type: "text",
    match: (row, value) =>
      row.clientName.toLowerCase().includes(value.toLowerCase()),
  },
  situation: {
    type: "select",
    match: (row, value) => row.situation === value,
  },
  state: {
    type: "select",
    match: (row, value) => row.state === value,
  },
};

/** Campos do painel: cliente, situação e UF. */
export const useWalletFilters = (rows: WalletRow[]): FilterField[] =>
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
        key: "situation",
        label: "Situação",
        placeholder: "Todas as situações",
        // Do saudável ao perdido, não em ordem alfabética: quem abre o filtro
        // está caçando problema, e a fila de trabalho vem no caminho do olho.
        options: SITUATION_ORDER.map((situation) => ({
          value: situation,
          label: SITUATION_LABEL[situation],
        })),
      },
      {
        type: "select",
        key: "state",
        label: "Estado",
        placeholder: "Todos os estados",
        // As UFs que existem NA CARTEIRA — a lista fixa das 27 ofereceria
        // estados que devolveriam a tabela vazia.
        options: optionsFromRows(rows, (row) =>
          row.state ? { value: row.state, label: row.state } : null
        ),
      },
    ],
    [rows]
  );
