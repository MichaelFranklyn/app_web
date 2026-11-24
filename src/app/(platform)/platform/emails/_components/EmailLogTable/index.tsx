"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { plural } from "@/utils/format/plural";
import { Mail } from "lucide-react";
import { EmailLogEntry } from "../../interface";
import { STATUS_COLOR, STATUS_LABEL, eventLabel } from "../../utils";
import { formatLogMoment } from "@/utils/format/date";

/**
 * Uma linha por email. "Situação" é o que o NOSSO lado fez (a Brevo aceitou,
 * recusou, ou nem tentamos); "Retorno" é o que a Brevo contou depois — é ele
 * que diz se chegou.
 */
export function EmailLogTable({
  messages,
  filteredBy,
}: {
  messages: EmailLogEntry[];
  filteredBy: string | null;
}) {
  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>
          {filteredBy ? `Envios para ${filteredBy}` : "Últimos envios"}
        </Table.CardHead.Title>
      </Table.CardHead>

      {messages.length === 0 ? (
        <EmptyState.Root flat>
          <EmptyState.Icon>
            <Mail />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhum email registrado</EmptyState.Title>
          <EmptyState.Description>
            {filteredBy
              ? "O sistema nunca mandou email para este endereço — confira se ele está escrito igual ao do cadastro."
              : "Ainda não saiu nenhum email desde que o histórico começou a ser gravado."}
          </EmptyState.Description>
        </EmptyState.Root>
      ) : (
        <Table.Table cards>
          <Table.Header>
            <Table.Row>
              <Table.Head>Quando</Table.Head>
              <Table.Head>Destinatário</Table.Head>
              <Table.Head>Assunto</Table.Head>
              <Table.Head>Situação</Table.Head>
              <Table.Head>Retorno</Table.Head>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {messages.map((message) => (
              <Table.Row key={message.id}>
                <Table.Cell
                  label="Quando"
                  variant="dim"
                  className="whitespace-nowrap"
                >
                  {formatLogMoment(message.createdAt)}
                </Table.Cell>
                <Table.Cell label="Destinatário">{message.toEmail}</Table.Cell>
                <Table.Cell card="title">
                  <div className="flex flex-col gap-2">
                    <Title variant="body-sm">{message.subject}</Title>
                    {message.error && (
                      <Title variant="micro" color="red">
                        {message.error}
                      </Title>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell card="status">
                  <Badge.Root
                    color={STATUS_COLOR[message.status]}
                    appearance="tinted"
                    size="xs"
                  >
                    <Badge.Text>{STATUS_LABEL[message.status]}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                <Table.Cell label="Retorno">
                  <div className="flex flex-col gap-2">
                    <Title variant="body-sm">
                      {eventLabel(message.lastEvent)}
                    </Title>
                    {message.lastEventAt && (
                      <Title variant="micro" color="muted">
                        {formatLogMoment(message.lastEventAt)}
                      </Title>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Table>
      )}

      <Table.Footer>
        <Table.Footer.Info>
          {plural(messages.length, "email", "emails")} — os mais recentes
          primeiro
        </Table.Footer.Info>
      </Table.Footer>
    </Table.Root>
  );
}
