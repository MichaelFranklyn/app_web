"use client";

import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { Tabs } from "@/components/Tabs";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useTableData } from "@/hooks/useTableData";
import { FactoryAccessTab } from "./_components/FactoryAccessTab";
import { UsersHeader } from "./_components/UsersHeader";
import { UsersTable } from "./_components/UsersTable";
import { USERS_QUERY } from "./gql";
import { ITEMS_PER_PAGE, QueryData, SellersStats, User } from "./interface";
import { USER_SORTABLE_FIELDS } from "./utils";

interface Props {
  initialData: QueryData;
  stats: SellersStats;
}

/**
 * Tela única de pessoas: usuário e vendedor são a mesma coisa (a diferença é ter
 * ou não perfil de campo), então a lista é uma só. A aba de acessos por fábrica
 * veio de /sellers — é a visão cruzada que não cabe no perfil de uma pessoa.
 */
export default function UsersContent({ initialData, stats }: Props) {
  const tableData = useTableData<QueryData, User>({
    query: USERS_QUERY,
    fields: {
      search: { type: "text", queryField: "name" },
    },
    getConnection: (data) => data.users_list,
    itemsPerPage: ITEMS_PER_PAGE,
    // Quem ordena é o banco, sobre a empresa inteira: a lista pagina, e
    // ordenar em memória alinharia só as dez linhas abertas — "a pessoa mais
    // antiga" seria a mais antiga da página.
    sortableFields: USER_SORTABLE_FIELDS,
    initialData,
  });

  const optimistic = useOptimisticList<User>({
    initialData: tableData.displayedData,
  });

  return (
    <PageContent>
      <UsersHeader
        stats={stats}
        onAddOptimistic={optimistic.addOptimistic}
        search={tableData.inputValues.search ?? ""}
        totalItems={tableData.totalItems}
      />

      <Tabs.Root defaultValue="pessoas">
        <Tabs.List data-tour="users-tabs">
          <Tabs.Item value="pessoas">Pessoas</Tabs.Item>
          <Tabs.Item value="acessos">Acessos por Fábrica</Tabs.Item>
        </Tabs.List>

        {tableData.error && optimistic.items.length === 0 ? (
          <Tabs.Content value="pessoas">
            <div className="mt-16">
              <QueryError onRetry={() => tableData.refetch()} />
            </div>
          </Tabs.Content>
        ) : (
          <UsersTable
            {...tableData}
            items={optimistic.items}
            onUpdateOptimistic={optimistic.updateOptimistic}
            onRemoveOptimistic={optimistic.removeOptimistic}
            onRollback={optimistic.rollback}
            onCommit={optimistic.commit}
          />
        )}

        <FactoryAccessTab />
      </Tabs.Root>
    </PageContent>
  );
}
