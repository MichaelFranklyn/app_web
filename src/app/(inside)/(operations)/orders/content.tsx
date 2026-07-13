"use client";

import { PageContent } from "@/components/PageContent";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useTableData } from "@/hooks/useTableData";
import { useQuery } from "@apollo/client/react";
import { OrdersHeader } from "./_components/OrdersHeader";
import { OrdersTable } from "./_components/OrdersTable";
import { ORDER_STATS_QUERY, ORDERS_QUERY } from "./gql";
import { ITEMS_PER_PAGE, Order, OrdersStats, QueryData } from "./interface";

export default function OrdersContent({
  initialData,
}: {
  initialData: QueryData;
}) {
  const tableData = useTableData<QueryData, Order>({
    query: ORDERS_QUERY,
    fields: {
      search: { type: "text", queryField: "search" },
    },
    getConnection: (data) => data.orders_list,
    itemsPerPage: ITEMS_PER_PAGE,
    initialData,
  });

  // KPIs no cliente: o cache do Apollo persiste entre navegações, então
  // refletem mudanças de pedidos/itens sem depender do Router Cache do Next.
  const { data: statsData } = useQuery<OrdersStats>(ORDER_STATS_QUERY);

  const optimistic = useOptimisticList<Order>({
    initialData: tableData.displayedData,
  });

  return (
    <PageContent>
      <OrdersHeader
        stats={statsData}
        onAddOptimistic={optimistic.addOptimistic}
      />
      <OrdersTable
        items={optimistic.items}
        loading={tableData.loading}
        currentPage={tableData.currentPage}
        setCurrentPage={tableData.setCurrentPage}
        totalPages={tableData.totalPages}
        totalItems={tableData.totalItems}
        inputValues={tableData.inputValues}
        setFilter={tableData.setFilter}
      />
    </PageContent>
  );
}
