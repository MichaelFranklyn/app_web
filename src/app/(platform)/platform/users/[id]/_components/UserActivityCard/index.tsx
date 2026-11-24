"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { Activity } from "lucide-react";
import { operationLabel } from "../../../../utils";
import { UserActivityEntry } from "../../interface";
import { formatLogMoment } from "@/utils/format/date";
import { formatDuration } from "@/utils/format/duration";

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
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>O que fez</Table.CardHead.Title>
        <Table.CardHead.Description>
          {/* Sem linha nenhuma, contar "0 de 0" é pior que não contar: a frase
              descreve um recorte que não existe. */}
          {entries.length > 0
            ? `As ${entries.length} ações mais recentes, de ${total} nos últimos 90 dias.`
            : "O que esta pessoa fez no sistema, nos últimos 90 dias."}
        </Table.CardHead.Description>
      </Table.CardHead>

      {loading && entries.length === 0 ? (
        <Loading.Skeleton className="h-[200px] w-full" />
      ) : entries.length === 0 ? (
        <EmptyState.Root flat>
          <EmptyState.Icon>
            <Activity />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhuma ação registrada</EmptyState.Title>
          <EmptyState.Description>
            Esta pessoa não executou nada no período — ou não entra desde antes
            de o registro existir.
          </EmptyState.Description>
        </EmptyState.Root>
      ) : (
        <>
          <Table.Table cards>
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
                  <Table.Cell
                    label="Quando"
                    variant="dim"
                    className="whitespace-nowrap"
                  >
                    {formatLogMoment(entry.createdAt)}
                  </Table.Cell>

                  <Table.Cell card="title" wrap>
                    <div className="flex min-w-0 flex-col gap-2">
                      <Title
                        variant="body-sm"
                        weight="semibold"
                        className="[overflow-wrap:anywhere]"
                      >
                        {operationLabel(entry.operation)}
                      </Title>
                      {entry.errorMessage && (
                        <Title
                          variant="micro"
                          color="red"
                          className="[overflow-wrap:anywhere]"
                        >
                          {entry.errorMessage}
                        </Title>
                      )}
                    </div>
                  </Table.Cell>

                  <Table.Cell card="status" className="whitespace-nowrap">
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

                  <Table.Cell
                    label="Duração"
                    variant="dim"
                    className="whitespace-nowrap"
                  >
                    {formatDuration(entry.durationMs)}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Table>
        </>
      )}
    </Table.Root>
  );
}
