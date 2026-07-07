"use client";

import { Loading } from "@/components/Loading";
import { Table } from "@/components/Table";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useQuery } from "@apollo/client/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useClientRoute } from "../context";
import { SELLER_CLIENT_FACTORIES_QUERY } from "../gql";
import {
  SellerClientFactoriesQueryResponse,
  SellerClientFactory,
} from "../interface";
import { FactoryLinksTable } from "./_components/FactoryLinksTable";

export default function FactoriesContent() {
  const { clientId: id } = useClientRoute();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [autoOpenLink, setAutoOpenLink] = useState(false);

  // Fluxo pós-criação: ?link=1 abre o modal uma vez e o parâmetro é removido
  // da URL para não reabrir em refresh/voltar.
  useEffect(() => {
    if (searchParams.get("link") === "1") {
      setAutoOpenLink(true);
      router.replace(pathname);
    }
  }, [searchParams, router, pathname]);

  const { data, loading, refetch } =
    useQuery<SellerClientFactoriesQueryResponse>(
      SELLER_CLIENT_FACTORIES_QUERY,
      {
        variables: {
          input: {
            filters: [{ field: "client_id", operator: "eq", value: id }],
            first: 50,
          },
        },
        skip: !id,
      }
    );

  const connections = useMemo<SellerClientFactory[]>(
    () => data?.sellerClientFactoryList.edges.map((e) => e.node) ?? [],
    [data]
  );

  const optimisticLinks = useOptimisticList<SellerClientFactory>({
    initialData: connections,
  });

  if (loading && !data) {
    return (
      <Table.Root>
        <div className="flex flex-col gap-8 p-24">
          <Loading.Skeleton className="h-[16px] w-1/4" />
          <Loading.Skeleton className="h-[40px] w-full" />
          <Loading.Skeleton className="h-[40px] w-full" />
        </div>
      </Table.Root>
    );
  }

  return (
    <FactoryLinksTable
      clientId={id}
      connections={optimisticLinks.items}
      onChanged={() => refetch()}
      autoOpenLink={autoOpenLink}
      onUpdateOptimistic={optimisticLinks.updateOptimistic}
      onRemoveOptimistic={optimisticLinks.removeOptimistic}
      onCommit={optimisticLinks.commit}
      onRollback={optimisticLinks.rollback}
    />
  );
}
