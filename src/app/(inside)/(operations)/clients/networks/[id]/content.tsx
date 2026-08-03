"use client";

import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { useTableData } from "@/hooks/useTableData";

import { ITEMS_PER_PAGE } from "../utils";
import { NetworkDetailHeader } from "./_components/NetworkDetailHeader";
import { NetworkStoresTable } from "./_components/NetworkStoresTable";
import { CLIENT_NETWORK_QUERY, NETWORK_STORES_QUERY } from "./gql";
import {
  ClientNetworkDetailData,
  NetworkStore,
  NetworkStoresData,
} from "./interface";

interface Props {
  networkId: string;
}

export default function NetworkDetailContent({ networkId }: Props) {
  const { data, loading, error, refetch } = useQuery<ClientNetworkDetailData>(
    CLIENT_NETWORK_QUERY,
    { variables: { id: networkId } }
  );

  // As lojas são a carteira recortada por `network_id` — mesmo caminho do filtro
  // da lista de clientes, então os dois lugares contam a mesma coisa.
  const baseFilters = useMemo(
    () => [{ field: "network_id", operator: "eq", value: networkId }],
    [networkId]
  );

  const table = useTableData<NetworkStoresData, NetworkStore>({
    query: NETWORK_STORES_QUERY,
    fields: {},
    getConnection: (d) => d.network_stores,
    baseFilters,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const network = data?.clientNetwork?.data ?? null;

  if (error && !network) {
    return (
      <PageContent>
        <QueryError onRetry={() => refetch()} />
      </PageContent>
    );
  }

  return (
    <PageContent>
      <NetworkDetailHeader network={network} loading={loading} />
      <NetworkStoresTable table={table} stores={table.displayedData} />
    </PageContent>
  );
}
