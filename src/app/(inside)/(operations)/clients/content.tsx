"use client";

import { PageContent } from "@/components/PageContent";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useTableData } from "@/hooks/useTableData";
import { ClientsHeader } from "./_components/ClientsHeader";
import { ClientsTable } from "./_components/ClientsTable";
import { CLIENTS_QUERY } from "./gql";
import { Client, ClientsContentProps, QueryData } from "./interface";
import { TABLE_FIELDS } from "./utils";

export default function ClientesContent({ stats }: ClientsContentProps) {
  const tableData = useTableData<QueryData, Client>({
    query: CLIENTS_QUERY,
    fields: TABLE_FIELDS,
    getConnection: (data) => data.clients_list,
    itemsPerPage: 5,
  });

  const optimistic = useOptimisticList<Client>({
    initialData: tableData.displayedData,
  });

  return (
    <PageContent>
      <ClientsHeader stats={stats} onAddOptimistic={optimistic.addOptimistic} />

      <ClientsTable
        items={optimistic.items}
        inputValues={tableData.inputValues}
        setFilter={tableData.setFilter}
        loading={tableData.loading}
        totalItems={tableData.totalItems}
        currentPage={tableData.currentPage}
        totalPages={tableData.totalPages}
        setCurrentPage={tableData.setCurrentPage}
      />
    </PageContent>
  );
}
