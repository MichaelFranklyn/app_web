"use client";

import { formatDuration } from "@/utils/format/duration";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { CheckCircle2 } from "lucide-react";
import { operationLabel } from "../../../utils";
import { OperationHealthReport } from "../../interface";
import { failureRate, operationTone } from "../../utils";

const TONE_COLOR = { ok: "green", atencao: "amber", urgente: "red" } as const;

/**
 * Como cada operação do sistema vem se comportando.
 *
 * A lista traz TODAS as operações usadas na janela, não só as quebradas: é o
 * inventário do que roda. Some a operação sadia e não há como ver que ela
 * existe e vai bem — e "nada aqui" passaria a significar duas coisas
 * diferentes (tudo em ordem, ou ninguém usou nada).
 */
export function OperationHealthCard({
  report,
}: {
  report: OperationHealthReport;
}) {
  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Operações</Table.CardHead.Title>
        <Table.CardHead.Description>
          O que falhou e o que demorou nos últimos 30 dias, mais grave primeiro.
          Recusa esperada — senha errada, cadastro duplicado — não conta como
          falha.
        </Table.CardHead.Description>
      </Table.CardHead>

      {report.operations.length === 0 ? (
        <EmptyState.Root flat>
          <EmptyState.Icon>
            <CheckCircle2 />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhuma operação no período</EmptyState.Title>
          <EmptyState.Description>
            Ninguém executou nada nos últimos 30 dias — não é sinal de saúde, é
            ausência de uso.
          </EmptyState.Description>
        </EmptyState.Root>
      ) : (
        <>
          <Table.Table cards>
            <Table.Header>
              <Table.Row>
                <Table.Head>Operação</Table.Head>
                <Table.Head align="right">Chamadas</Table.Head>
                <Table.Head align="right">Falhas</Table.Head>
                <Table.Head align="right">Típica</Table.Head>
                <Table.Head align="right">p95</Table.Head>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {report.operations.map((row) => {
                const tone = operationTone(row);
                return (
                  <Table.Row key={row.operation}>
                    <Table.Cell card="title" wrap>
                      <div className="flex min-w-0 flex-col gap-2">
                        <Title
                          variant="body-sm"
                          weight="semibold"
                          className="[overflow-wrap:anywhere]"
                        >
                          {operationLabel(row.operation)}
                        </Title>
                        {row.lastErrorMessage && (
                          <Title
                            variant="micro"
                            color="red"
                            className="[overflow-wrap:anywhere]"
                          >
                            {row.lastErrorMessage}
                          </Title>
                        )}
                        {/* A recusa aparece como nota, nunca como alarme: é
                              fluxo normal e vira ruído se ganhar destaque. */}
                        {row.rejections > 0 && (
                          <Title variant="micro" color="muted">
                            {row.rejections} recusadas (senha, duplicidade,
                            regra)
                          </Title>
                        )}
                      </div>
                    </Table.Cell>

                    <Table.Cell
                      align="right"
                      label="Chamadas"
                      variant="dim"
                      className="whitespace-nowrap"
                    >
                      {row.total}
                    </Table.Cell>

                    <Table.Cell
                      align="right"
                      label="Falhas"
                      className="whitespace-nowrap"
                    >
                      {row.errors === 0 ? (
                        <Title variant="body-sm" color="muted">
                          —
                        </Title>
                      ) : (
                        <Badge.Root color="red" appearance="tinted" size="xs">
                          <Badge.Text>
                            {row.errors} · {failureRate(row)}%
                          </Badge.Text>
                        </Badge.Root>
                      )}
                    </Table.Cell>

                    <Table.Cell
                      align="right"
                      label="Típica"
                      variant="dim"
                      className="whitespace-nowrap"
                    >
                      {formatDuration(row.medianMs)}
                    </Table.Cell>

                    {/* p95 é o sinal da linha (a cor diz se demorou): no
                          cartão ele ocupa o canto do título, que sozinho
                          deixava a linha inteira vazia à direita. */}
                    <Table.Cell
                      align="right"
                      card="value"
                      label="p95"
                      className="whitespace-nowrap"
                    >
                      <Title variant="body-sm" color={TONE_COLOR[tone]}>
                        {formatDuration(row.p95Ms)}
                      </Title>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Table>

          <Table.Footer>
            <Table.Footer.Info>
              {report.operations.length} operações · pico de{" "}
              {formatDuration(
                Math.max(...report.operations.map((row) => row.maxMs))
              )}
            </Table.Footer.Info>
          </Table.Footer>
        </>
      )}
    </Table.Root>
  );
}
