import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Title } from "@/components/Title";
import { Activity } from "lucide-react";
import Link from "next/link";
import { operationLabel } from "../../../../utils";
import { TenantActivityEntry } from "../../interface";

const formatMoment = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

interface Props {
  companyId: string;
  entries: TenantActivityEntry[];
  /** Total do período inteiro, não o das linhas mostradas: é ele que diz se o
   * corte abaixo esconde muita coisa. */
  total: number;
  loading: boolean;
}

/**
 * As últimas ações da empresa dentro do produto.
 *
 * Fica ao lado da auditoria de propósito — as duas respondem perguntas opostas
 * ("o que fizemos com esta empresa" × "o que ela fez") e é o cruzamento das
 * duas que explica uma conta parada ou uma reclamação de suporte.
 */
export function TenantActivityCard({
  companyId,
  entries,
  total,
  loading,
}: Props) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Atividade recente
        </Card.Header.Title>
        <Card.Header.Description>
          O que as pessoas desta empresa fizeram no sistema, nos últimos 90
          dias.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        {loading && entries.length === 0 ? (
          <Loading.Skeleton className="h-[180px] w-full" />
        ) : entries.length === 0 ? (
          <EmptyState.Root>
            <EmptyState.Icon>
              <Activity size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>Nenhuma ação registrada</EmptyState.Title>
            <EmptyState.Description>
              Ninguém desta empresa usou o sistema no período — ou o registro
              começou depois da última vez que usaram.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          <div className="flex flex-col gap-16">
            <ol className="flex flex-col gap-12">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="flex flex-col gap-[2px] border-l-2 border-(--border) pl-12"
                >
                  <div className="flex flex-wrap items-baseline gap-8">
                    <Title variant="caption" weight="semibold">
                      {operationLabel(entry.operation)}
                    </Title>
                    {entry.status === "error" && (
                      <Badge.Root color="red" appearance="tinted" size="xs">
                        <Badge.Text>Erro</Badge.Text>
                      </Badge.Root>
                    )}
                  </div>
                  <Title variant="micro" color="muted">
                    {formatMoment(entry.createdAt)}
                    {entry.userEmail ? ` · ${entry.userEmail}` : ""}
                  </Title>
                </li>
              ))}
            </ol>

            {/* O total precisa aparecer junto do link: sem ele, uma lista de
                doze linhas passa por "foi só isso que aconteceu". */}
            <Link
              href={`/platform/activity?company=${companyId}`}
              className="w-fit"
            >
              <Title
                variant="body-sm"
                color="muted"
                className="underline underline-offset-2"
              >
                Ver as {total} ações do período
              </Title>
            </Link>
          </div>
        )}
      </Card.Body>
    </Card.Root>
  );
}
