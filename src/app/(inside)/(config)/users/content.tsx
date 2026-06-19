"use client";

import { PageContent } from "@/components/PageContent";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useTableData } from "@/hooks/useTableData";
import { UsersHeader } from "./_components/UsersHeader";
import { UsersTable } from "./_components/UsersTable";
import { USERS_QUERY } from "./gql";
import { QueryData, User } from "./interface";

export default function UsersContent() {
  const tableData = useTableData<QueryData, User>({
    query: USERS_QUERY,
    fields: {
      search: { type: "text", queryField: "name" },
    },
    getConnection: (data) => data.users_list,
    itemsPerPage: 10,
  });

  const optimistic = useOptimisticList<User>({
    initialData: tableData.displayedData,
  });

  return (
    <PageContent>
      <UsersHeader onAddOptimistic={optimistic.addOptimistic} items={optimistic.items} />

      <UsersTable
        {...tableData}
        items={optimistic.items}
        onUpdateOptimistic={optimistic.updateOptimistic}
        onRemoveOptimistic={optimistic.removeOptimistic}
        onRollback={optimistic.rollback}
        onCommit={optimistic.commit}
      />
    </PageContent>
  );
}
