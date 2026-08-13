"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { Activity } from "lucide-react";
import { operationLabel } from "../../../../utils";
import { UserActivityEntry } from "../../interface";

const formatMoment = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatDuration = (ms: number | null): string => {
  if (ms === null) return "—";
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
};

interface Props {
  entries: UserActivityEntry[];
  total: number;
  loading: boolean;
}

/**
 * O que a pessoa fez, na ordem em que fez.
 *
 * Com segundos no horário, ao contrário do resto do console: quando o chamado
 * é "cliquei em salvar e não aconteceu nada", o que resolve é ver a sequência
 * exata de ações do minuto, e sem os segundos várias linhas viram a mesma.
 */
export function UserActivityCard({ entries, total, loading }: Props) {
  return (
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          O que fez
        </Card.Header.Title>
        <Card.Header.Description>
          {/* Sem linha nenhuma, contar "0 de 0" é pior que não contar: a frase
              descreve um recorte que não existe. */}
          {entries.length > 0
            ? `As ${entries.length} ações mais recentes, de ${total} nos últimos 90 dias.`
            : "O que esta pessoa fez no sistema, nos últimos 90 dias."}
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        {loading && entries.length === 0 ? (
          <Loading.Skeleton className="h-[200px] w-full" />
        ) : entries.length === 0 ? (
          <EmptyState.Root>
            <EmptyState.Icon>
              <Activity size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>Nenhuma ação registrada</EmptyState.Title>
            <EmptyState.Description>
              Esta pessoa não executou nada no período — ou não entra desde
              antes de o registro existir.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          <Table.Root>
            <Table.Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Quando</Table.Head>
                  <Table.Head>Ação</Table.Head>
                  <Table.Head>Resultado</Table.Head>
                  <Table.Head>Duração</Table.Head>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {entries.map((entry) => (
                  <Table.Row key={entry.id}>
                    <Table.Cell variant="dim" className="whitespace-nowrap">
                      {formatMoment(entry.createdAt)}
                    </Table.Cell>

                    <Table.Cell className="max-w-[280px]">
                      <div className="flex min-w-0 flex-col gap-[2px]">
                        <Title
                          variant="body-sm"
                          weight="semibold"
                          className="truncate"
                        >
                          {operationLabel(entry.operation)}
                        </Title>
                        {entry.errorMessage && (
                          <Title
                            variant="micro"
                            color="red"
                            className="truncate"
                          >
                            {entry.errorMessage}
                          </Title>
                        )}
                      </div>
                    </Table.Cell>

                    <Table.Cell className="whitespace-nowrap">
                      <Badge.Root
                        color={entry.status === "error" ? "red" : "green"}
                        appearance="tinted"
                        size="xs"
                      >
                        <Badge.Text>
                          {entry.status === "error" ? "Erro" : "Ok"}
                        </Badge.Text>
                      </Badge.Root>
                    </Table.Cell>

                    <Table.Cell variant="dim" className="whitespace-nowrap">
                      {formatDuration(entry.durationMs)}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Table>
          </Table.Root>
        )}
      </Card.Body>
    </Card.Root>
  );
}
