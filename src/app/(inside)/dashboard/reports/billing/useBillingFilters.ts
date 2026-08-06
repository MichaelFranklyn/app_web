"use client";

import { FilterField } from "@/components/Filters";
import { LocalField } from "@/hooks/useLocalTable";
import { useMemo } from "react";

import { optionsFromRows } from "../rowOptions";
import { BillingRow } from "./interface";
import { BILLING_SITUATION_OPTIONS } from "./utils";

/**
 * O que cada campo do painel recorta nas duplicatas. A chave é a mesma do
 * `FilterField`; o `match` decide se a linha fica.
 *
 * Substituiu as abas de situação: os recortes se COMBINAM, e é essa combinação
 * que faz a ligação de cobrança — "as vencidas DESTA fábrica".
 */
export const BILLING_FILTER_FIELDS: Record<string, LocalField<BillingRow>> = {
  search: {
    type: "text",
    match: (row, value) =>
      row.clientName.toLowerCase().includes(value.toLowerCase()),
  },
  situation: {
    type: "select",
    match: (row, value) => row.situation === value,
  },
  factoryId: {
    type: "select",
    match: (row, value) => row.factoryId === value,
  },
  sellerId: {
    type: "select",
    match: (row, value) => row.sellerId === value,
  },
};

/** Campos do painel: cliente, situação, fábrica e vendedor. */
export const useBillingFilters = (rows: BillingRow[]): FilterField[] =>
  useMemo(() => {
    const factories = optionsFromRows(rows, (row) => ({
      value: row.factoryId,
      label: row.factoryName,
    }));
    const sellers = optionsFromRows(rows, (row) => ({
      value: row.sellerId,
      label: row.sellerName,
    }));

    return [
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
        options: BILLING_SITUATION_OPTIONS,
      },
      {
        type: "select",
        key: "factoryId",
        label: "Fábrica",
        placeholder: "Todas as fábricas",
        options: factories,
        // Uma fábrica só: escolher a única não recorta nada.
        hidden: factories.length < 2,
      },
      {
        type: "select",
        key: "sellerId",
        label: "Vendedor",
        placeholder: "Todos os vendedores",
        options: sellers,
        // O vendedor logado só tem as próprias parcelas; o seletor da barra de
        // cima já resolve o recorte do gestor. Aqui ele só ajuda quando há mais
        // de um vendedor nas linhas à vista.
        hidden: sellers.length < 2,
      },
    ];
  }, [rows]);
