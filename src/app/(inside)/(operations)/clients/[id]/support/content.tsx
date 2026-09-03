"use client";

import { Button } from "@/components/Button";
import { HelpTooltip } from "@/components/HelpTooltip";
import { QueryError } from "@/components/QueryError";
import { SupportCaseModal } from "@/components/SupportCaseModal";
import { Title } from "@/components/Title";
import { SUPPORT_CASES_QUERY } from "@/graphql/support";
import { SupportCase } from "@/utils/support";
import { useQuery } from "@apollo/client/react";
import { Loading } from "@/components/Loading";
import { Plus } from "lucide-react";
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

  return (
    <div className="flex flex-col gap-16">
      <div className="flex flex-wrap items-center justify-between gap-16">
        <div className="flex items-center gap-6">
          <Title variant="heading-md">Atendimentos deste cliente</Title>
          <HelpTooltip
            label="O que entra aqui?"
            content={CLIENT_SUPPORT_HELP}
          />
        </div>
        <Button.Root
          type="button"
          appearance="solid"
          color="amber"
          size="sm"
          noUppercase
          onClick={() => setCreating(true)}
        >
          <Button.Icon icon={Plus} />
          <Button.Title>Registrar atendimento</Button.Title>
        </Button.Root>
      </div>

      <ClientSupportList cases={cases} />

      <SupportCaseModal
        open={creating}
        onOpenChange={setCreating}
        clientId={clientId}
        clientName={client.nomeFantasia ?? client.razaoSocial}
        onSaved={() => refetch()}
      />
    </div>
  );
}
