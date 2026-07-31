"use client";

import { PageContent } from "@/components/PageContent";
import { Tabs } from "@/components/Tabs";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useTableData } from "@/hooks/useTableData";
import { useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { OrdersHeader } from "./_components/OrdersHeader";
import { OrdersTable } from "./_components/OrdersTable";
import { ORDER_STATS_QUERY, ORDERS_QUERY } from "./gql";
import { ITEMS_PER_PAGE, Order, OrdersStats, QueryData } from "./interface";

/** Aba "aguardando faturamento": confirmados que a fábrica ainda não faturou. */
const PENDING_FILTERS = [{ field: "pending_invoice", value: "true" }];

export default function OrdersContent({
  initialData,
}: {
  initialData: QueryData;
}) {
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

  const tableData = useTableData<QueryData, Order>({
    query: ORDERS_QUERY,
    fields: {
      search: { type: "text", queryField: "search" },
    },
    getConnection: (data) => data.orders_list,
    itemsPerPage: ITEMS_PER_PAGE,
    baseFilters: isPending ? PENDING_FILTERS : undefined,
    // O SSR trouxe a lista SEM filtro: semear o cache na aba filtrada mostraria
    // os pedidos errados (as variáveis não batem com o que ela consulta).
    initialData: isPending ? undefined : initialData,
  });

  // KPIs no cliente: o cache do Apollo persiste entre navegações, então
  // refletem mudanças de pedidos/itens sem depender do Router Cache do Next.
  const { data: statsData } = useQuery<OrdersStats>(ORDER_STATS_QUERY);

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
      setFilter={tableData.setFilter}
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
        onAddOptimistic={optimistic.addOptimistic}
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
