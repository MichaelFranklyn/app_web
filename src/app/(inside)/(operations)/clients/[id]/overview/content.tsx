"use client";

import { useOptimisticObject } from "@/hooks/useOptimisticObject";
import { useQuery } from "@apollo/client/react";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { CLIENT_QUERY, SELLER_CLIENT_FACTORIES_QUERY } from "../gql";
import {
  ClientDetail,
  ClientDetailQueryResponse,
  SellerClientFactoriesQueryResponse,
  SellerClientFactory,
} from "../interface";
import { buildAddress } from "../utils";
import { ClientDetailSkeleton } from "../_components/ClientDetailSkeleton";
import { AddressCard } from "./_components/AddressCard";
import { ContactCard } from "./_components/ContactCard";
import { NotesCard } from "./_components/NotesCard";
import { SummaryCard } from "./_components/SummaryCard";

export default function OverviewContent() {
  const params = useParams();
  const id = params.id as string;

  const { data, loading, refetch } = useQuery<ClientDetailQueryResponse>(
    CLIENT_QUERY,
    {
      variables: { id },
      skip: !id,
    }
  );

  const { data: connectionsData, loading: connectionsLoading } =
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
    () =>
      connectionsData?.sellerClientFactoryList.edges.map((e) => e.node) ?? [],
    [connectionsData]
  );

  const clientData = data?.client.data;

  const optimisticClient = useOptimisticObject<ClientDetail>({
    initialData: clientData ?? ({} as ClientDetail),
  });
  const clientView = clientData ? optimisticClient.data : undefined;

  if (loading || connectionsLoading) {
    return <ClientDetailSkeleton />;
  }

  const lastVisitDate =
    connections
      .reduce<string | null>((latest, c) => {
        if (!c.lastVisitDate) return latest;
        if (!latest || c.lastVisitDate > latest) return c.lastVisitDate;
        return latest;
      }, null)
      ?.split("T")[0] ?? "—";

  return (
    <div className="flex items-start gap-20">
      <div className="flex min-w-0 flex-1 flex-col gap-16">
        <AddressCard
          clientId={id}
          address={clientView ? buildAddress(clientView) : "—"}
          currentAddress={clientView || undefined}
          onUpdateOptimistic={optimisticClient.updateOptimistic}
          onCommit={optimisticClient.commit}
          onRollback={optimisticClient.rollback}
        />

        <ContactCard clientId={id} />
      </div>

      <div className="flex w-65 shrink-0 flex-col gap-12">
        <SummaryCard
          lastVisitDate={lastVisitDate}
          cnae={clientView?.cnae ?? "—"}
          cnaeDescription={clientView?.cnaeDescription ?? null}
        />

        <NotesCard
          companyClientId={clientView?.companyClient?.id ?? ""}
          companyClient={clientView?.companyClient ?? null}
          notes={clientView?.companyClient?.notes || ""}
          onUpdated={() => refetch()}
          onUpdateOptimistic={optimisticClient.updateOptimistic}
          onCommit={optimisticClient.commit}
          onRollback={optimisticClient.rollback}
        />
      </div>
    </div>
  );
}
