"use client";

import { Button } from "@/components/Button";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { StatCard } from "@/components/StatCard";
import { useSeedQuery } from "@/hooks/useSeedQuery";
import { useQuery } from "@apollo/client/react";
import { FormEvent, useState } from "react";
import { EmailLogTable } from "./_components/EmailLogTable";
import { SuppressionAlert } from "./_components/SuppressionAlert";
import { PLATFORM_EMAIL_LOG_QUERY } from "./gql";
import { EmailLogQueryData, EmailsContentProps } from "./interface";
import { quotaTone } from "./utils";

const LIMIT = 50;

/**
 * "O cliente diz que não recebeu o email."
 *
 * Sem busca, os últimos envios de toda a plataforma; com o endereço, o
 * histórico dele e — o que mais resolve chamado — se ele está na lista de
 * bloqueio e por quê. A busca sai no Enter, não a cada tecla: endereço pela
 * metade não acha nada e só gera query.
 */
export default function PlatformEmailsContent({ seed }: EmailsContentProps) {
  useSeedQuery([
    {
      query: PLATFORM_EMAIL_LOG_QUERY,
      variables: { email: null, limit: LIMIT },
      data: seed,
    },
  ]);
  const [draft, setDraft] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const { data, loading, error, refetch } = useQuery<EmailLogQueryData>(
    PLATFORM_EMAIL_LOG_QUERY,
    { variables: { email, limit: LIMIT }, fetchPolicy: "cache-and-network" }
  );

  const report = data?.platformEmailLog?.data ?? null;

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setEmail(draft.trim() || null);
  };

  return (
    <PageContent>
      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Eyebrow color="purple">Console</PanelHeader.Eyebrow>
            <PanelHeader.Title>Emails</PanelHeader.Title>
            <PanelHeader.Description>
              O que saiu, o que chegou e quem está bloqueado. Busque pelo
              endereço de quem diz que não recebeu.
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      <form onSubmit={handleSearch} className="flex items-end gap-8">
        <InputSearch
          size="sm"
          containerClassName="w-full max-w-[420px]"
          placeholder="email@cliente.com.br"
          aria-label="Buscar por endereço"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button.Root type="submit" appearance="solid" color="amber" size="sm">
          <Button.Title>Buscar</Button.Title>
        </Button.Root>
        {email && (
          <Button.Root
            type="button"
            appearance="ghost"
            size="sm"
            onClick={() => {
              setDraft("");
              setEmail(null);
            }}
          >
            <Button.Title>Ver todos</Button.Title>
          </Button.Root>
        )}
      </form>

      {error && !report ? (
        <QueryError onRetry={() => refetch()} />
      ) : loading && !report ? (
        <Loading.Skeleton className="h-[320px] w-full" />
      ) : report ? (
        <>
          <div className="tablet:grid-cols-2 grid grid-cols-1 gap-12">
            <StatCard
              label="Enviados hoje"
              value={`${report.sentToday} de ${report.dailyQuota}`}
              tone={
                quotaTone(report.sentToday, report.dailyQuota) === "atencao"
                  ? "red"
                  : "default"
              }
              hint="Contra a cota diária da Brevo. Acima de 80% o sistema avisa no log; ao estourar, a Brevo para de aceitar até a meia-noite."
            />
          </div>

          {report.suppression && (
            <SuppressionAlert
              suppression={report.suppression}
              onReleased={() => refetch()}
            />
          )}

          <EmailLogTable messages={report.messages} filteredBy={report.email} />
        </>
      ) : null}
    </PageContent>
  );
}
