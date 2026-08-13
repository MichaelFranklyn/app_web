"use client";

import { Badge } from "@/components/Badges";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { CheckCircle2 } from "lucide-react";
import { operationLabel } from "../../../utils";
import { OperationHealthReport } from "../../interface";
import { failureRate, formatMs, operationTone } from "../../utils";

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
    <Card.Root>
      <Card.Header>
        <Card.Header.Title size="sm" weight="semibold">
          Operações
        </Card.Header.Title>
        <Card.Header.Description>
          O que falhou e o que demorou nos últimos 30 dias, mais grave primeiro.
          Recusa esperada — senha errada, cadastro duplicado — não conta como
          falha.
        </Card.Header.Description>
      </Card.Header>

      <Card.Body>
        {report.operations.length === 0 ? (
          <EmptyState.Root>
            <EmptyState.Icon>
              <CheckCircle2 size={32} />
            </EmptyState.Icon>
            <EmptyState.Title>Nenhuma operação no período</EmptyState.Title>
            <EmptyState.Description>
              Ninguém executou nada nos últimos 30 dias — não é sinal de saúde,
              é ausência de uso.
            </EmptyState.Description>
          </EmptyState.Root>
        ) : (
          <Table.Root>
            <Table.Table>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Operação</Table.Head>
                  <Table.Head>Chamadas</Table.Head>
                  <Table.Head>Falhas</Table.Head>
                  <Table.Head>Típica</Table.Head>
                  <Table.Head>p95</Table.Head>
                </Table.Row>
              </Table.Header>

              <Table.Body>
                {report.operations.map((row) => {
                  const tone = operationTone(row);
                  return (
                    <Table.Row key={row.operation}>
                      <Table.Cell className="max-w-[280px]">
                        <div className="flex min-w-0 flex-col gap-[2px]">
                          <Title
                            variant="body-sm"
                            weight="semibold"
                            className="truncate"
                          >
                            {operationLabel(row.operation)}
                          </Title>
                          {row.lastErrorMessage && (
                            <Title
                              variant="micro"
                              color="red"
                              className="truncate"
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

                      <Table.Cell variant="dim" className="whitespace-nowrap">
                        {row.total}
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap">
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

                      <Table.Cell variant="dim" className="whitespace-nowrap">
                        {formatMs(row.medianMs)}
                      </Table.Cell>

                      <Table.Cell className="whitespace-nowrap">
                        <Title variant="body-sm" color={TONE_COLOR[tone]}>
                          {formatMs(row.p95Ms)}
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
                {formatMs(
                  Math.max(...report.operations.map((row) => row.maxMs))
                )}
              </Table.Footer.Info>
            </Table.Footer>
          </Table.Root>
        )}
      </Card.Body>
    </Card.Root>
  );
}
