"use client";

import { PageContent } from "@/components/PageContent";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useTableData } from "@/hooks/useTableData";

import { NetworksHeader } from "./_components/NetworksHeader";
import { NetworksTable } from "./_components/NetworksTable";
import { CLIENT_NETWORKS_QUERY } from "./gql";
import { ClientNetwork, ClientNetworksData } from "./interface";
import {
  ITEMS_PER_PAGE,
  NETWORK_FIELDS,
  NETWORK_SORTABLE_FIELDS,
} from "./utils";

interface Props {
  /** 1ª página trazida pelo servidor, para o cache nascer quente. */
  initialData: ClientNetworksData;
}

export default function NetworksContent({ initialData }: Props) {
  const table = useTableData<ClientNetworksData, ClientNetwork>({
    query: CLIENT_NETWORKS_QUERY,
    fields: NETWORK_FIELDS,
    getConnection: (data) => data.client_networks,
    itemsPerPage: ITEMS_PER_PAGE,
    // `name` é a única coluna que o banco alcança — as outras três da tabela
    // são consolidadas por DataLoader depois da consulta. A lista é metade de
    // um contrato: nome fora dela cai no `getattr` e a lista se ordena por
    // `created_at` em silêncio.
    sortableFields: NETWORK_SORTABLE_FIELDS,
    initialData,
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
