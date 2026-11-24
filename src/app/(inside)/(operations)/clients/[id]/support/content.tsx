"use client";

import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { QueryError } from "@/components/QueryError";
import { SupportCaseModal } from "@/components/SupportCaseModal";
import { SUPPORT_CASES_QUERY } from "@/graphql/support";
import { SupportCase } from "@/utils/support";
import { useQuery } from "@apollo/client/react";
import { Loading } from "@/components/Loading";
import { Headset, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { useClientRoute } from "../context";
import { ClientSupportList } from "./_components/ClientSupportList";
import { CLIENT_SUPPORT_HELP } from "./help";
import { ClientSupportCasesData } from "./interface";

/**
 * Teto de casos trazidos de uma vez. É o histórico de UM cliente: mesmo um
 * cliente problemático fica na casa das dezenas, e trazer tudo é o que deixa a
 * aba separar os abertos dos encerrados sem uma segunda ida à rede.
 */
const MAX_CASES = 100;

export default function ClientSupportContent() {
  const { clientId, client } = useClientRoute();
  const [creating, setCreating] = useState(false);

  const variables = useMemo(
    () => ({
      input: {
        first: MAX_CASES,
        filters: [{ field: "client_id", operator: "eq", value: clientId }],
      },
    }),
    [clientId]
  );

  const { data, loading, error, refetch } = useQuery<ClientSupportCasesData>(
    SUPPORT_CASES_QUERY,
    { variables, skip: !clientId }
  );

  const cases = useMemo<SupportCase[]>(
    () => data?.support_cases.edges.map((e) => e.node) ?? [],
    [data]
  );

  if (loading && cases.length === 0) {
    return <Loading.Skeleton className="h-[280px] w-full" />;
  }
  if (error && cases.length === 0) {
    return <QueryError onRetry={() => refetch()} />;
  }

  const createButton = (
    <Button.Root
      type="button"
      appearance="solid"
      color="amber"
      size="sm"
      fullWidthBelowDesktop
      onClick={() => setCreating(true)}
    >
      <Button.Icon icon={Plus} />
      <Button.Title>Registrar reclamação</Button.Title>
    </Button.Root>
  );

  return (
    <>
      {/* Um título só, o do card (crítica de 23/11/2026): o "Reclamações deste
          cliente" solto acima do card repetia o título de dentro dele. Sem
          caso nenhum, só o estado vazio, sem cabeçalho de tabela vazia. */}
      {cases.length === 0 ? (
        <EmptyState.Root>
          <EmptyState.Icon>
            <Headset />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhuma reclamação registrada</EmptyState.Title>
          <EmptyState.Description>
            Quando este cliente reclamar de algo — mercadoria, pagamento,
            entrega — registre aqui para acompanhar a tratativa com a fábrica.
          </EmptyState.Description>
          <EmptyState.Actions>{createButton}</EmptyState.Actions>
        </EmptyState.Root>
      ) : (
        <ClientSupportList
          cases={cases}
          help={CLIENT_SUPPORT_HELP}
          action={createButton}
        />
      )}

      <SupportCaseModal
        open={creating}
        onOpenChange={setCreating}
        clientId={clientId}
        clientName={client.nomeFantasia ?? client.razaoSocial}
        onSaved={() => refetch()}
      />
    </>
  );
}
