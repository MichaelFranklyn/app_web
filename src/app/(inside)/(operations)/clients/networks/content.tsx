"use client";

import { PageContent } from "@/components/PageContent";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useTableData } from "@/hooks/useTableData";

import { NetworksHeader } from "./_components/NetworksHeader";
import { NetworksTable } from "./_components/NetworksTable";
import { CLIENT_NETWORKS_QUERY } from "./gql";
import { ClientNetwork, ClientNetworksData } from "./interface";
import { ITEMS_PER_PAGE, NETWORK_FIELDS } from "./utils";

export default function NetworksContent() {
  const table = useTableData<ClientNetworksData, ClientNetwork>({
    query: CLIENT_NETWORKS_QUERY,
    fields: NETWORK_FIELDS,
    getConnection: (data) => data.client_networks,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const optimistic = useOptimisticList<ClientNetwork>({
    initialData: table.displayedData,
  });

  const onChanged = () => table.refetch();

  return (
    <PageContent>
      <NetworksHeader
        onAddOptimistic={optimistic.addOptimistic}
        onChanged={onChanged}
      />
      <NetworksTable
        table={table}
        networks={optimistic.items}
        optimistic={optimistic}
        onChanged={onChanged}
      />
    </PageContent>
  );
}
