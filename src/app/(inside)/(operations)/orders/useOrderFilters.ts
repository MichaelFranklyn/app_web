"use client";

import { FilterField } from "@/components/Filters";
import { SelectOption } from "@/components/Input";
import { useAsyncSelectOptions } from "@/hooks/useAsyncSelectOptions";
import { factoryName } from "@/utils/company";
import { useQuery } from "@apollo/client/react";
import { useCallback, useMemo } from "react";
import {
  clientOptionLabel,
  clientOptionSearchText,
} from "../_shared/clientOption";
import {
  ORDER_FILTER_CLIENTS_QUERY,
  ORDER_FILTER_FACTORIES_QUERY,
  ORDER_FILTER_SELLERS_QUERY,
} from "./gql";
import {
  OrderFilterClients,
  OrderFilterFactories,
  OrderFilterSellers,
} from "./interface";
import { ORDER_STATUS_OPTIONS } from "./utils";

// Vendedores e fábricas cabem numa página só (dezenas por empresa).
const OPTIONS_PAGE = 200;

interface Params {
  /** Só gestor escolhe o vendedor — o vendedor logado já vê apenas os seus. */
  canFilterBySeller: boolean;
  /**
   * Esconde o filtro de situação. A aba "Ainda não faturados" já É um recorte
   * por situação (confirmado e sem faturamento): deixar o campo ali só
   * permitiria pedir "entregues que ainda não foram faturados" e receber vazio.
   */
  hideStatus?: boolean;
}

/**
 * Monta os campos do painel de filtros da tela de pedidos.
 *
 * As opções vêm de três fontes diferentes de propósito: vendedores e fábricas
 * são listas curtas e fechadas (uma página resolve), enquanto a carteira de
 * clientes pode ter milhares de linhas — ali a busca acontece no servidor,
 * senão o select truncaria a lista sem avisar.
 */
export function useOrderFilters({
  canFilterBySeller,
  hideStatus = false,
}: Params): FilterField[] {
  const sellersQuery = useQuery<OrderFilterSellers>(
    ORDER_FILTER_SELLERS_QUERY,
    { variables: { input: { first: OPTIONS_PAGE } }, skip: !canFilterBySeller }
  );

  const factoriesQuery = useQuery<OrderFilterFactories>(
    ORDER_FILTER_FACTORIES_QUERY,
    { variables: { input: { first: OPTIONS_PAGE } } }
  );

  const clients = useAsyncSelectOptions<
    OrderFilterClients,
    OrderFilterClients["order_filter_clients"]["edges"][number]["node"]
  >({
    query: ORDER_FILTER_CLIENTS_QUERY,
    // `?? { edges: [] }` porque o `errorPolicy: "all"` do useAsyncQuery entrega
    // `data` PARCIAL quando a query falha em parte: sem isso, um select de
    // filtro derrubava a página inteira de pedidos.
    getConnection: useCallback(
      (data: OrderFilterClients) => data.order_filter_clients ?? { edges: [] },
      []
    ),
    toOption: useCallback(
      (node: {
        id: string;
        razaoSocial: string;
        nomeFantasia: string | null;
        cnpj: string | null;
      }) => ({
        value: node.id,
        label: clientOptionLabel(node),
        searchText: clientOptionSearchText(node),
      }),
      []
    ),
    searchField: "razao_social,nome_fantasia",
  });

  const sellerOptions: SelectOption[] = useMemo(
    () =>
      sellersQuery.data?.order_filter_sellers?.edges.map(({ node }) => ({
        value: node.id,
        label: node.name,
      })) ?? [],
    [sellersQuery.data]
  );

  const factoryOptions: SelectOption[] = useMemo(
    () =>
      factoriesQuery.data?.order_filter_factories?.edges
        // O filtro casa com `factory_id` do pedido, que é o id da FÁBRICA —
        // não o do vínculo. Vínculo sem fábrica carregada fica de fora.
        .filter(({ node }) => node.factory)
        .map(({ node }) => ({
          value: node.factory!.id,
          label: factoryName(node.factory),
        })) ?? [],
    [factoriesQuery.data]
  );

  return useMemo(
    () => [
      {
        type: "select",
        key: "sellerId",
        label: "Vendedor",
        placeholder: "Todos os vendedores",
        options: sellerOptions,
        loading: sellersQuery.loading,
        hidden: !canFilterBySeller,
      },
      {
        type: "select",
        key: "factoryId",
        label: "Fábrica",
        placeholder: "Todas as fábricas",
        options: factoryOptions,
        loading: factoriesQuery.loading,
      },
      {
        type: "select",
        key: "clientId",
        label: "Cliente",
        placeholder: "Todos os clientes",
        options: clients.options,
        loading: clients.loading,
        onSearch: clients.onSearch,
      },
      {
        type: "select",
        key: "status",
        label: "Situação",
        placeholder: "Todas as situações",
        options: ORDER_STATUS_OPTIONS,
        hidden: hideStatus,
      },
      {
        type: "date-range",
        key: "orderDateFrom",
        toKey: "orderDateTo",
        label: "Data do pedido",
      },
      {
        type: "date-range",
        key: "invoicedFrom",
        toKey: "invoicedTo",
        label: "Data de faturamento",
      },
    ],
    [
      canFilterBySeller,
      hideStatus,
      sellerOptions,
      sellersQuery.loading,
      factoryOptions,
      factoriesQuery.loading,
      clients.options,
      clients.loading,
      clients.onSearch,
    ]
  );
}
