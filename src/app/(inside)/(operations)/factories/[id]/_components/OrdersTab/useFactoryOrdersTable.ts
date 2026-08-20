"use client";

import { FilterField } from "@/components/Filters";
import { SelectOption } from "@/components/Input";
import { FieldConfig } from "@/hooks/useTableFilters";
import { useAsyncSelectOptions } from "@/hooks/useAsyncSelectOptions";
import { useCompleteList } from "@/hooks/useCompleteList";
import { useTableData } from "@/hooks/useTableData";
import { ORDER_STATUS_OPTIONS } from "@/app/(inside)/_shared/orderStatus";
import { useCallback, useMemo } from "react";
import {
  clientOptionLabel,
  clientOptionSearchText,
} from "../../../../_shared/clientOption";
import {
  FACTORY_ORDERS_QUERY,
  FACTORY_ORDER_CLIENTS_QUERY,
  FACTORY_ORDER_SELLERS_QUERY,
  FactoryOrder,
  FactoryOrderClientsData,
  FactoryOrderSellersData,
} from "./gql";

export const ITEMS_PER_PAGE = 10;

interface OrdersQueryData {
  factory_orders: {
    edges: { node: FactoryOrder }[];
    totalCount: number;
  };
}

/**
 * Filtros da aba, traduzidos nas colunas que o backend entende.
 *
 * São os mesmos nomes da lista de pedidos (`ORDER_TABLE_FIELDS`): é o mesmo
 * resolver `orders` atendendo as duas telas, e um nome inventado aqui viraria
 * "filtro não suportado" — ou, pior, filtro descartado em silêncio.
 */
const FIELDS: Record<string, FieldConfig> = {
  clientId: { type: "select", queryField: "client_id" },
  sellerId: { type: "select", queryField: "seller_id" },
  // Viaja como NOME do enum (CONFIRMED); o backend traduz para o valor gravado.
  status: { type: "select", queryField: "status" },
  orderDateFrom: { type: "select", queryField: "order_date", operator: "gte" },
  orderDateTo: { type: "select", queryField: "order_date", operator: "lte" },
};

/**
 * Por onde a aba pode ser ordenada — os mesmos nomes do `sortKey` de cada
 * `Table.Head`, e as mesmas colunas que a lista de pedidos usa.
 *
 * Cliente e vendedor não são colunas de `orders` (lá são só o UUID da chave
 * estrangeira): o repositório alcança a tabela vizinha e ordena pelo nome
 * EXIBIDO (ver `_related_sort_criteria`). Um nome fora desta lista é ignorado
 * pelo `useTableData` antes de virar consulta.
 */
const SORTABLE_FIELDS = [
  "order_date",
  "status",
  "total_amount",
  "commission_amount",
  "client_name",
  "seller_name",
];

/** A ordem que o backend já aplica sozinho — só para o cabeçalho mostrá-la. */
const DEFAULT_SORT = { key: "order_date", direction: "desc" as const };

const getClients = (d: FactoryOrderClientsData) =>
  d.factory_order_clients ?? { edges: [], totalCount: 0 };
const getSellers = (d: FactoryOrderSellersData) => d.factory_order_sellers;

/**
 * Os pedidos de UMA fábrica: página, ordem e filtros resolvidos no BANCO.
 *
 * Antes a aba baixava os 50 primeiros pedidos e fazia todo o resto em memória.
 * Numa fábrica com movimento isso não era um teto: era uma tela que respondia
 * errado sem avisar.
 *
 * - "Ordenar por Valor" trazia o maior dos 50 baixados, não o maior da fábrica;
 * - as opções de Cliente e Vendedor saíam das próprias linhas, então filtrar
 *   por quem comprou antes daquelas 50 era impossível — o nome nem aparecia;
 * - filtrar devolvia "Nenhum pedido encontrado" para pedidos que existem;
 * - não havia paginação nem contagem: nada na tela dizia que faltava algo.
 *
 * Agora quem ordena, filtra e pagina é o banco, e o rodapé mostra o total.
 */
export function useFactoryOrdersTable(factoryId: string) {
  const baseFilters = useMemo(
    () => [{ field: "factory_id", value: factoryId }],
    [factoryId]
  );

  const table = useTableData<OrdersQueryData, FactoryOrder>({
    query: FACTORY_ORDERS_QUERY,
    fields: FIELDS,
    getConnection: (data) => data.factory_orders,
    itemsPerPage: ITEMS_PER_PAGE,
    sortableFields: SORTABLE_FIELDS,
    backendDefaultSort: DEFAULT_SORT,
    baseFilters,
  });

  // Clientes: catálogo grande, busca no servidor (ver a query).
  const clients = useAsyncSelectOptions<
    FactoryOrderClientsData,
    FactoryOrderClientsData["factory_order_clients"]["edges"][number]["node"]
  >({
    query: FACTORY_ORDER_CLIENTS_QUERY,
    getConnection: useCallback(getClients, []),
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

  // Vendedores com acesso a ESTA fábrica: lista curta, vem inteira.
  const sellerAccessInput = useMemo(
    () => ({
      filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
    }),
    [factoryId]
  );

  const sellersQuery = useCompleteList<FactoryOrderSellersData>(
    FACTORY_ORDER_SELLERS_QUERY,
    sellerAccessInput,
    getSellers
  );

  const sellerOptions = useMemo<SelectOption[]>(() => {
    const seen = new Map<string, string>();
    sellersQuery.data?.factory_order_sellers?.edges.forEach(({ node }) => {
      if (node.isActive && node.seller)
        seen.set(node.seller.id, node.seller.name);
    });
    return [...seen.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  }, [sellersQuery.data]);

  const filterFields = useMemo<FilterField[]>(
    () => [
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
        key: "sellerId",
        label: "Vendedor",
        placeholder: "Todos os vendedores",
        options: sellerOptions,
        loading: sellersQuery.loading,
      },
      {
        type: "select",
        key: "status",
        label: "Situação",
        placeholder: "Todas as situações",
        options: ORDER_STATUS_OPTIONS,
      },
      {
        type: "date-range",
        key: "orderDateFrom",
        toKey: "orderDateTo",
        label: "Data do pedido",
      },
    ],
    [
      clients.options,
      clients.loading,
      clients.onSearch,
      sellerOptions,
      sellersQuery.loading,
    ]
  );

  return { ...table, filterFields };
}
