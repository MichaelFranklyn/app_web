"use client";

import { FilterField } from "@/components/Filters";
import { SelectOption } from "@/components/Input";
import { LocalField } from "@/hooks/useLocalTable";
import { useMemo } from "react";

import { SITUATION_LABEL, SITUATION_ORDER } from "../situation";
import { PurchaseRow } from "./interface";

/**
 * O que cada campo do painel recorta na lista.
 *
 * O recorte é em memória porque o relatório vem inteiro do backend (ver
 * `usePurchasesReport`): a chave é a mesma do `FilterField`, e o `match` decide
 * se a linha fica.
 */
export const PURCHASE_FILTER_FIELDS: Record<string, LocalField<PurchaseRow>> = {
  search: {
    type: "text",
    match: (row, value) =>
      row.clientName.toLowerCase().includes(value.toLowerCase()),
  },
  factoryId: {
    type: "select",
    match: (row, value) => row.factoryId === value,
  },
  purchased: {
    type: "select",
    match: (row, value) =>
      value === PURCHASED_YES ? row.orderCount > 0 : row.orderCount === 0,
  },
  situation: {
    type: "select",
    match: (row, value) => row.situation === value,
  },
};

const PURCHASED_YES = "yes";

/**
 * "Já comprou" separado da situação: a pergunta "quem compra desta fábrica?" não
 * é sobre ritmo, e achá-la juntando quatro situações não é óbvio para ninguém. O
 * vínculo sem pedido ("nunca comprou") é carteira, não cliente da fábrica.
 */
const PURCHASED_OPTIONS: SelectOption[] = [
  { value: PURCHASED_YES, label: "Só quem já comprou" },
  { value: "no", label: "Só quem nunca comprou" },
];

/**
 * As situações como opções do seletor, no vocabulário único dos relatórios.
 *
 * Do saudável ao perdido (`SITUATION_ORDER`), e não em ordem alfabética: quem
 * abre o filtro está caçando problema, e a fila de trabalho ("Atrasado",
 * "Parado") tem de estar no caminho do olho.
 */
const SITUATION_OPTIONS: SelectOption[] = SITUATION_ORDER.map((situation) => ({
  value: situation,
  label: SITUATION_LABEL[situation],
}));

/**
 * Campos do painel de filtros da aba: cliente, fábrica, compras e situação.
 *
 * Painel, e não abas com seletor ao lado: são recortes que se combinam
 * ("os atrasados da Delta"), e abas só sabem mostrar um de cada vez. É também o
 * mesmo controle das outras listas do sistema — ver
 * `@/components/Filters`.
 *
 * As fábricas saem das PRÓPRIAS linhas: o seletor não oferece uma fábrica que
 * devolveria a tabela vazia.
 */
export const usePurchaseFilters = (factories: SelectOption[]): FilterField[] =>
  useMemo(
    () => [
      {
        type: "text",
        key: "search",
        label: "Cliente",
        placeholder: "Razão social ou nome fantasia",
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
        key: "purchased",
        label: "Compras",
        placeholder: "Todos os clientes",
        options: PURCHASED_OPTIONS,
      },
      {
        type: "select",
        key: "situation",
        label: "Situação na fábrica",
        placeholder: "Todas as situações",
        options: SITUATION_OPTIONS,
      },
    ],
    [factories]
  );
