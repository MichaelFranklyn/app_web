"use client";

import { Button } from "@/components/Button";
import { FollowUpModal } from "@/components/FollowUpModal";
import { Loading } from "@/components/Loading";
import { QueryError } from "@/components/QueryError";
import { Title } from "@/components/Title";
import { FOLLOW_UPS_QUERY } from "@/graphql/followUps";
import { FollowUp } from "@/utils/followUp";
import { useQuery } from "@apollo/client/react";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useClientRoute } from "../context";
import { ClientFollowUpList } from "./_components/ClientFollowUpList";
import { ClientFollowUpsData } from "./interface";

/**
 * Teto do histórico trazido de uma vez: é UM cliente, e trazer tudo deixa a aba
 * separar o que está em aberto do que já aconteceu sem outra ida à rede.
 */
const MAX_FOLLOW_UPS = 100;

export default function ClientFollowUpsContent() {
  const { clientId, client } = useClientRoute();
  const [creating, setCreating] = useState(false);

  const variables = useMemo(
    () => ({
      input: {
        first: MAX_FOLLOW_UPS,
        filters: [
          { field: "client_id", operator: "eq", value: clientId },
          // O histórico inteiro: sem isto a lista traria só o que está aberto.
          { field: "situation", operator: "eq", value: "ALL" },
        ],
      },
    }),
    [clientId]
  );

  const { data, loading, error, refetch } = useQuery<ClientFollowUpsData>(
    FOLLOW_UPS_QUERY,
    { variables, skip: !clientId }
  );

  const followUps = useMemo<FollowUp[]>(
    () => data?.follow_ups?.edges.map((e) => e.node) ?? [],
    [data]
  );

  if (loading && followUps.length === 0) {
    return <Loading.Skeleton className="h-[280px] w-full" />;
  }
  if (error && followUps.length === 0) {
    return <QueryError onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-wrap items-center justify-between gap-16">
        <Title variant="heading-md">Contatos agendados</Title>
        <Button.Root
          type="button"
          appearance="solid"
          color="amber"
          size="sm"
          noUppercase
          onClick={() => setCreating(true)}
        >
          <Button.Icon icon={Plus} />
          <Button.Title>Agendar contato</Button.Title>
        </Button.Root>
      </div>

      <ClientFollowUpList followUps={followUps} />

      <FollowUpModal
        open={creating}
        onOpenChange={setCreating}
        clientId={clientId}
        clientName={client.nomeFantasia ?? client.razaoSocial}
        onSaved={() => refetch()}
      />
    </div>
  );
}
