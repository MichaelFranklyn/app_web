"use client";

import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useTableData } from "@/hooks/useTableData";
import { ClientsHeader } from "./_components/ClientsHeader";
import { ClientsTable } from "./_components/ClientsTable";
import { CLIENTS_QUERY } from "./gql";
import { Client, ClientsContentProps, QueryData } from "./interface";
import { useClassificationOptions } from "./useClassificationOptions";
import { useClientFilters } from "./useClientFilters";
import { useSellerScope } from "./useSellerScope";
import { CLIENT_SORTABLE_FIELDS, ITEMS_PER_PAGE, TABLE_FIELDS } from "./utils";

export default function ClientesContent({
  stats,
  initialData,
  canFilterBySeller,
}: ClientsContentProps) {
  const tableData = useTableData<QueryData, Client>({
    query: CLIENTS_QUERY,
    fields: TABLE_FIELDS,
    getConnection: (data) => data.clients_list,
    itemsPerPage: ITEMS_PER_PAGE,
    sortableFields: CLIENT_SORTABLE_FIELDS,
    initialData,
  });

  const selectedSellerId = tableData.inputValues.sellerId || null;

  const sellerScope = useSellerScope({
    canFilterBySeller,
    selectedSellerId,
    fallbackStats: stats,
  });

  const classification = useClassificationOptions();

  const filterFields = useClientFilters({
    canFilterBySeller,
    sellerOptions: sellerScope.sellerOptions,
    sellersLoading: sellerScope.sellersLoading,
    networkOptions: classification.networkOptions,
    segmentOptions: classification.segmentOptions,
    classificationLoading: classification.loading,
  });

  const optimistic = useOptimisticList<Client>({
    initialData: tableData.displayedData,
  });

  return (
    <PageContent>
      <ClientsHeader
        stats={sellerScope.stats}
        onAddOptimistic={optimistic.addOptimistic}
        inputValues={tableData.inputValues}
        // O painel de filtros e a ordenação da tabela definem o que o arquivo
        // exportado contém — e o cabeçalho do PDF os escreve por extenso.
        filterFields={filterFields}
        order={tableData.order}
        hasClients={tableData.totalItems > 0}
      />

      {tableData.error && optimistic.items.length === 0 ? (
        <QueryError onRetry={() => tableData.refetch()} />
      ) : (
        <ClientsTable
          items={optimistic.items}
          inputValues={tableData.inputValues}
          setFilter={tableData.setFilter}
          setFilters={tableData.setFilters}
          sort={tableData.sort}
          filterFields={filterFields}
          loading={tableData.loading}
          totalItems={tableData.totalItems}
          currentPage={tableData.currentPage}
          totalPages={tableData.totalPages}
          setCurrentPage={tableData.setCurrentPage}
        />
      )}
    </PageContent>
  );
}
