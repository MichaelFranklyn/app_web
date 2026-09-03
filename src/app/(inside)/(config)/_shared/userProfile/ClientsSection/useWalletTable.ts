"use client";

import { FilterField } from "@/components/Filters";
import { SelectOption } from "@/components/Input";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useTableData } from "@/hooks/useTableData";
import { FieldConfig } from "@/hooks/useTableFilters";
import { PRIORITY_ALIASES, PRIORITY_OPTIONS } from "@/utils/clientPriority";
import { factoryName } from "@/utils/company";
import { useMemo } from "react";

import { SELLER_FACTORY_ACCESSES_QUERY } from "../gql";
import { SellerAccessesQueryResponse } from "../interface";
import { ClientNode, SellerClientsData, SELLER_CLIENTS_QUERY } from "./gql";

export const ITEMS_PER_PAGE = 10;

/**
 * Filtros da carteira, traduzidos nas colunas que o backend entende.
 *
 * `client_name` não é coluna do vínculo (que guarda só o `client_id`): o
 * repositório o traduz num `client_id IN (SELECT ...)` sobre razão social e
 * nome fantasia — ver `SellerClientFactoryRepository._apply_filters`.
 */
const FIELDS: Record<string, FieldConfig> = {
  search: { type: "text", queryField: "client_name" },
  factoryId: { type: "select", queryField: "factory_id" },
  // Vínculos antigos guardam "high"/"medium"/"low": sem os apelidos, escolher
  // "Alta" esconderia essas linhas sem nada avisar.
  priority: {
    type: "select",
    queryField: "priority",
    aliases: PRIORITY_ALIASES,
  },
};

/**
 * Por onde a carteira pode ser ordenada.
 *
 * `client_name` o repositório resolve com um join até a tabela de clientes; o
 * resto são colunas do próprio vínculo. Fábrica ficou de fora porque no vínculo
 * ela é um UUID — ordenar por ele alinharia a lista por um identificador que
 * ninguém vê. Prioridade também: o valor gravado é texto ("alta", "baixa",
 * "media"), e a ordem alfabética põe "baixa" antes de "alta".
 */
const SORTABLE_FIELDS = [
  "client_name",
  "visit_frequency_days",
  "last_visit_date",
  "created_at",
];

const getAccesses = (d: SellerAccessesQueryResponse) => d.seller_accesses;

/**
 * A carteira de UMA pessoa: página, ordem e filtros resolvidos no BANCO.
 *
 * A seção baixava os 50 primeiros vínculos e mostrava todos numa tabela só —
 * numa carteira de 50+ clientes (as reais passam disso), os últimos não tinham
 * como ser alcançados: não havia página seguinte, nem busca, nem ordenação.
 */
export function useWalletTable(sellerId: string) {
  const baseFilters = useMemo(
    () => [{ field: "seller_id", value: sellerId }],
    [sellerId]
  );

  const table = useTableData<SellerClientsData, ClientNode>({
    query: SELLER_CLIENTS_QUERY,
    fields: FIELDS,
    getConnection: (data) => data.seller_clients,
    itemsPerPage: ITEMS_PER_PAGE,
    sortableFields: SORTABLE_FIELDS,
    baseFilters,
  });

  // As fábricas que ESTA pessoa atende — e não só as que aparecem na página
  // aberta. É a mesma consulta da seção de acessos logo acima, com as mesmas
  // variáveis: o Apollo responde do cache.
  const accessInput = useMemo(
    () => ({
      filters: [{ field: "seller_id", operator: "eq", value: sellerId }],
    }),
    [sellerId]
  );

  const accessesQuery = useCompleteList<SellerAccessesQueryResponse>(
    SELLER_FACTORY_ACCESSES_QUERY,
    accessInput,
    getAccesses,
    { skip: !sellerId }
  );

  const factoryOptions = useMemo<SelectOption[]>(() => {
    const seen = new Map<string, string>();
    accessesQuery.data?.seller_accesses?.edges.forEach(({ node }) => {
      if (node.factory)
        seen.set(node.factory.id, factoryName(node.factory) ?? "—");
    });
    return [...seen.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [accessesQuery.data]);

  const filterFields = useMemo<FilterField[]>(
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
        options: factoryOptions,
        loading: accessesQuery.loading,
      },
      {
        type: "select",
        key: "priority",
        label: "Prioridade",
        placeholder: "Todas as prioridades",
        options: PRIORITY_OPTIONS,
      },
    ],
    [factoryOptions, accessesQuery.loading]
  );

  return { ...table, filterFields };
}
