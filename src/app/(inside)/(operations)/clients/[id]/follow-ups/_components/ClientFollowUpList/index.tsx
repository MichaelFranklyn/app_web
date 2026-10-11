"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import {
  FOLLOW_UP_SITUATION_COLOR,
  FOLLOW_UP_SITUATION_HINT,
  FOLLOW_UP_SITUATION_SINGULAR,
  FollowUp,
  followUpDueLabel,
  isFollowUpOpen,
  responsibleName,
} from "@/utils/followUp";
import { PhoneCall } from "lucide-react";
import { useMemo } from "react";

interface Props {
  followUps: FollowUp[];
}

const COLUMNS = 4;

/**
 * Os contatos com este cliente: os EM ABERTO primeiro (pelo dia, o mais
 * próximo no topo), depois o histórico (o mais recente no topo). Quem abre a
 * aba quer saber "o que está combinado com ele?" e, logo abaixo, "o que já foi
 * conversado?".
 */
export function ClientFollowUpList({ followUps }: Props) {
  const ordered = useMemo(() => {
    const open = followUps
      .filter((f) => isFollowUpOpen(f.status))
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const closed = followUps
      .filter((f) => !isFollowUpOpen(f.status))
      .sort((a, b) => (b.closedAt ?? "").localeCompare(a.closedAt ?? ""));
    return [...open, ...closed];
  }, [followUps]);

  const openCount = ordered.filter((f) => isFollowUpOpen(f.status)).length;

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>
          {openCount > 0
            ? `${openCount} contato(s) em aberto`
            : "Histórico de contatos"}
        </Table.CardHead.Title>
      </Table.CardHead>
      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Dia</Table.Head>
            <Table.Head>Motivo</Table.Head>
            <Table.Head>Situação</Table.Head>
            <Table.Head>Quem faz</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {ordered.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <PhoneCall size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum contato agendado</EmptyState.Title>
                  <EmptyState.Description>
                    Combinou de voltar a falar com este cliente? Agende — no
                    dia, ele aparece nas Pendências.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            ordered.map((item) => {
              const open = isFollowUpOpen(item.status);
              return (
                <Table.Row key={item.id} href={`/follow-ups/${item.id}`}>
                  <Table.Cell>
                    <div className="flex flex-col">
                      <Table.CellText variant="strong">
                        {formatDate(item.dueDate)}
                      </Table.CellText>
                      {open && (
                        <Title
                          variant="body-xs"
                          color={item.daysLate > 0 ? "red" : "muted"}
                        >
                          {followUpDueLabel(item.daysLate)}
                        </Title>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col">
                      <Table.CellText>{item.reason}</Table.CellText>
                      {!open && item.outcome && (
                        <Table.CellText variant="dim">
                          {item.outcome}
                        </Table.CellText>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge.Root
                      color={FOLLOW_UP_SITUATION_COLOR[item.situation]}
                      appearance="tinted"
                      size="sm"
                      title={FOLLOW_UP_SITUATION_HINT[item.situation]}
                    >
                      <Badge.Text>
                        {FOLLOW_UP_SITUATION_SINGULAR[item.situation]}
                      </Badge.Text>
                    </Badge.Root>
                  </Table.Cell>
                  <Table.Cell>
                    <Table.CellText variant="dim">
                      {responsibleName(item.responsible, "—")}
                    </Table.CellText>
                  </Table.Cell>
                </Table.Row>
              );
            })
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
