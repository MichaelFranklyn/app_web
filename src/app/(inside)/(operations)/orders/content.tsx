"use client";

import { PageContent } from "@/components/PageContent";
import { Tabs } from "@/components/Tabs";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { buildQueryFilters, useTableData } from "@/hooks/useTableData";
import { useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { OrdersHeader } from "./_components/OrdersHeader";
import { OrdersTable } from "./_components/OrdersTable";
import { ORDER_STATS_QUERY, ORDERS_QUERY } from "./gql";
import { ITEMS_PER_PAGE, Order, OrdersStats, QueryData } from "./interface";
import { useOrderFilters } from "./useOrderFilters";
import {
  ORDER_DEFAULT_SORT,
  ORDER_SORTABLE_FIELDS,
  ORDER_TABLE_FIELDS,
  PENDING_ORDER_TABLE_FIELDS,
} from "./utils";

/** Aba "aguardando faturamento": confirmados que a fábrica ainda não faturou. */
const PENDING_FILTERS = [{ field: "pending_invoice", value: "true" }];

interface Props {
  initialData: QueryData;
  /** Gestor (owner/admin/su) pode filtrar por vendedor; vendedor já vê só o seu. */
  canFilterBySeller: boolean;
}

export default function OrdersContent({
  initialData,
  canFilterBySeller,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "pending" ? "pending" : "all";
  const isPending = tab === "pending";

  // Trocar de aba volta para a página 1: a paginação é a mesma da URL, e ficar
  // na página 3 de uma lista que agora tem 5 pedidos mostraria a lista vazia.
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "pending") params.set("tab", "pending");
    else params.delete("tab");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const baseFilters = isPending ? PENDING_FILTERS : undefined;
  const tableFields = isPending
    ? PENDING_ORDER_TABLE_FIELDS
    : ORDER_TABLE_FIELDS;

  const tableData = useTableData<QueryData, Order>({
    query: ORDERS_QUERY,
    fields: tableFields,
    getConnection: (data) => data.orders_list,
    itemsPerPage: ITEMS_PER_PAGE,
    sortableFields: ORDER_SORTABLE_FIELDS,
    backendDefaultSort: ORDER_DEFAULT_SORT,
    baseFilters,
    // O SSR trouxe a lista SEM filtro: semear o cache na aba filtrada mostraria
    // os pedidos errados (as variáveis não batem com o que ela consulta).
    initialData: isPending ? undefined : initialData,
  });

  const filterFields = useOrderFilters({
    canFilterBySeller,
    hideStatus: isPending,
  });

  // Os KPIs consultam o MESMO recorte da tabela (mesmos filtros, mesma aba):
  // sem isso, filtrar por um vendedor deixaria o topo somando a empresa
  // inteira — dois números diferentes para a mesma pergunta na mesma tela.
  const queryFilters = useMemo(
    () => buildQueryFilters(tableFields, tableData.inputValues),
    [tableFields, tableData.inputValues]
  );

  const statsFilters = useMemo(
    () => [
      ...(baseFilters ?? []).map((filter) => ({ ...filter, operator: "eq" })),
      ...queryFilters,
    ],
    [baseFilters, queryFilters]
  );

  const { data: statsData } = useQuery<OrdersStats>(ORDER_STATS_QUERY, {
    variables: { input: { first: ITEMS_PER_PAGE, filters: statsFilters } },
  });

  const optimistic = useOptimisticList<Order>({
    initialData: tableData.displayedData,
  });

  const table = (
    <OrdersTable
      items={optimistic.items}
      loading={tableData.loading}
      currentPage={tableData.currentPage}
      setCurrentPage={tableData.setCurrentPage}
      totalPages={tableData.totalPages}
      totalItems={tableData.totalItems}
      inputValues={tableData.inputValues}
      setFilters={tableData.setFilters}
      sort={tableData.sort}
      filterFields={filterFields}
      title={isPending ? "Pedidos a faturar" : "Lista de pedidos"}
      emptyTitle={isPending ? "Nenhum pedido esperando faturamento" : undefined}
      emptyDescription={
        isPending
          ? "Todo pedido confirmado já foi faturado. Os que ainda não foram aparecem aqui."
          : undefined
      }
    />
  );

  return (
    <PageContent>
      <OrdersHeader
        stats={statsData}
        isFiltered={queryFilters.length > 0}
        onAddOptimistic={optimistic.addOptimistic}
        // Os mesmos filtros dos KPIs: o arquivo sai com o recorte da tela.
        exportFilters={statsFilters}
        filterFields={filterFields}
        inputValues={tableData.inputValues}
        scopeLabel={isPending ? "Somente: ainda não faturados" : null}
        hasOrders={tableData.totalItems > 0}
      />

      <Tabs.Root value={tab} onValueChange={handleTabChange}>
        <Tabs.List data-tour="orders-tabs">
          <Tabs.Item value="all">Todos os pedidos</Tabs.Item>
          <Tabs.Item value="pending">Ainda não faturados</Tabs.Item>
        </Tabs.List>

        <Tabs.Content value="all">{table}</Tabs.Content>
        <Tabs.Content value="pending">{table}</Tabs.Content>
      </Tabs.Root>
    </PageContent>
  );
}
