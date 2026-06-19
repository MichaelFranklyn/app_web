"use client";

import { PageContent } from "@/components/PageContent";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useTableData } from "@/hooks/useTableData";
import { FactoriesGrid } from "./_components/FactoriesGrid";
import { FactoriesHeader } from "./_components/FactoriesHeader";
import { COMPANY_FACTORIES_QUERY } from "./gql";
import { CompanyFactory, CompanyFactoriesQueryData } from "./interface";

export default function FactoriesContent() {
  const tableData = useTableData<CompanyFactoriesQueryData, CompanyFactory>({
    query: COMPANY_FACTORIES_QUERY,
    fields: {
      search: { type: "text", queryField: "name" },
    },
    getConnection: (data) => data.company_factories_list,
    itemsPerPage: 12,
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

      <FactoriesGrid
        items={optimistic.items}
        loading={tableData.loading}
        currentPage={tableData.currentPage}
        totalPages={tableData.totalPages}
        setCurrentPage={tableData.setCurrentPage}
      />
    </PageContent>
  );
}
