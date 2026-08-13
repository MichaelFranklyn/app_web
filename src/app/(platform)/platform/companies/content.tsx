"use client";

import { Button } from "@/components/Button";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { useTableData } from "@/hooks/useTableData";
import { Plus } from "lucide-react";
import { useState } from "react";
import { NewCompanyModal } from "./_components/NewCompanyModal";
import { TenantsTable } from "./_components/TenantsTable";
import { PLATFORM_TENANTS_QUERY } from "./gql";
import { PlatformTenant, QueryData, TenantsContentProps } from "./interface";
import { useTenantFilters } from "./useTenantFilters";
import { ITEMS_PER_PAGE, SORTABLE_FIELDS, TABLE_FIELDS } from "./utils";

export default function TenantsContent({ initialData }: TenantsContentProps) {
  const tableData = useTableData<QueryData, PlatformTenant>({
    query: PLATFORM_TENANTS_QUERY,
    fields: TABLE_FIELDS,
    getConnection: (data) => data.platform_tenants,
    itemsPerPage: ITEMS_PER_PAGE,
    sortableFields: SORTABLE_FIELDS,
    backendDefaultSort: { key: "created_at", direction: "desc" },
    initialData: initialData ?? undefined,
  });

  const filterFields = useTenantFilters();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow className="text-(--purple)">
              Console
            </PanelHeader.Eyebrow>
            <PanelHeader.Title>Empresas</PanelHeader.Title>
            <PanelHeader.Description>
              Todas as empresas da plataforma, com o uso de cada uma nos últimos
              30 dias.
            </PanelHeader.Description>

            {/* Dentro do `Left`, não como irmão dele: o wrapper das ações é
                `w-full` e mede a si mesmo para decidir se colapsa em ícones.
                Ao lado do título ele disputa a largura com o `flex-1` e a
                medição sai errada. */}
            <PanelHeader.Actions className="mt-6">
              <Button.Root
                appearance="solid"
                color="amber"
                size="sm"
                noUppercase
                onClick={() => setCreateOpen(true)}
              >
                <Button.Icon icon={Plus} />
                <Button.Title>Nova empresa</Button.Title>
              </Button.Root>
            </PanelHeader.Actions>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {tableData.error && tableData.displayedData.length === 0 ? (
        <QueryError onRetry={() => tableData.refetch()} />
      ) : (
        <TenantsTable
          items={tableData.displayedData}
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

      <NewCompanyModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => tableData.refetch()}
      />
    </PageContent>
  );
}
