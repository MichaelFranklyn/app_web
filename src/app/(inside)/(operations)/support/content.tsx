"use client";

import { PageContent } from "@/components/PageContent";
import { SUPPORT_CASES_QUERY, SUPPORT_COUNTS_QUERY } from "@/graphql/support";
import { useTableData } from "@/hooks/useTableData";
import { SupportCase } from "@/utils/support";
import { useQuery } from "@apollo/client/react";

import { SupportCounts } from "./_components/SupportCounts";
import { SupportHeader } from "./_components/SupportHeader";
import { SupportTable } from "./_components/SupportTable";
import { SupportCasesData, SupportCountsData } from "./interface";
import { useSupportFilters } from "./useSupportFilters";
import {
  ITEMS_PER_PAGE,
  SUPPORT_DEFAULT_SORT,
  SUPPORT_FIELDS,
  SUPPORT_SORTABLE_FIELDS,
} from "./utils";

interface Props {
  /** 1ª página trazida pelo servidor, para o cache nascer quente. */
  initialData?: SupportCasesData;
}

export default function SupportContent({ initialData }: Props) {
  const table = useTableData<SupportCasesData, SupportCase>({
    query: SUPPORT_CASES_QUERY,
    fields: SUPPORT_FIELDS,
    getConnection: (data) => data.support_cases,
    itemsPerPage: ITEMS_PER_PAGE,
    sortableFields: SUPPORT_SORTABLE_FIELDS,
    backendDefaultSort: SUPPORT_DEFAULT_SORT,
    initialData,
  });

  // Contagem por situação vem do servidor: a fila é paginada, e somar a página
  // diria "3 abertos" numa empresa com trinta.
  const counts = useQuery<SupportCountsData>(SUPPORT_COUNTS_QUERY);

  const filterFields = useSupportFilters();

  const onChanged = () => {
    table.refetch();
    void counts.refetch();
  };

  return (
    <PageContent>
      <SupportHeader onSaved={onChanged} />
      <SupportCounts data={counts.data} />
      <SupportTable
        cases={table.displayedData}
        loading={table.loading}
        sort={table.sort}
        filterFields={filterFields}
        inputValues={table.inputValues}
        setFilter={table.setFilter}
        setFilters={table.setFilters}
        currentPage={table.currentPage}
        totalPages={table.totalPages}
        totalItems={table.totalItems}
        setCurrentPage={table.setCurrentPage}
      />
    </PageContent>
  );
}
