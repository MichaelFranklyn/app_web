"use client";

import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useTableData } from "@/hooks/useTableData";
import { FactoriesGrid } from "./_components/FactoriesGrid";
import { FactoriesHeader } from "./_components/FactoriesHeader";
import { COMPANY_FACTORIES_QUERY } from "./gql";
import {
  CompanyFactory,
  CompanyFactoriesQueryData,
  ITEMS_PER_PAGE,
} from "./interface";

export default function FactoriesContent({
  initialData,
}: {
  initialData: CompanyFactoriesQueryData;
}) {
  const tableData = useTableData<CompanyFactoriesQueryData, CompanyFactory>({
    query: COMPANY_FACTORIES_QUERY,
    fields: {
      search: { type: "text", queryField: "name" },
    },
    getConnection: (data) => data.company_factories_list,
    itemsPerPage: ITEMS_PER_PAGE,
    initialData,
  });

  const optimistic = useOptimisticList<CompanyFactory>({
    initialData: tableData.displayedData,
  });

  return (
    <PageContent>
      <FactoriesHeader
        totalItems={tableData.totalItems}
        inputValues={tableData.inputValues}
        setFilter={tableData.setFilter}
        onAddOptimistic={optimistic.addOptimistic}
      />

      {tableData.error && optimistic.items.length === 0 ? (
        <QueryError onRetry={() => tableData.refetch()} />
      ) : (
        <FactoriesGrid
          items={optimistic.items}
          loading={tableData.loading}
          currentPage={tableData.currentPage}
          totalPages={tableData.totalPages}
          setCurrentPage={tableData.setCurrentPage}
        />
      )}
    </PageContent>
  );
}
