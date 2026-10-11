"use client";

import { Badge } from "@/components/Badges";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { clientDisplayName } from "@/utils/client";
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

interface Props {
  item: FollowUp;
  showResponsible: boolean;
}

/** Um contato. A linha inteira abre o agendamento, onde se conclui. */
export function FollowUpRow({ item, showResponsible }: Props) {
  const open = isFollowUpOpen(item.status);

  return (
    <Table.Row href={`/follow-ups/${item.id}`}>
      <Table.Cell>
        <div className="flex flex-col">
          <Table.CellText variant="strong">
            {formatDate(item.dueDate)}
          </Table.CellText>
          {open && (
            <Title
              variant="body-xs"
              color={
                item.daysLate > 0
                  ? "red"
                  : item.daysLate === 0
                    ? "amber"
                    : "muted"
              }
            >
              {followUpDueLabel(item.daysLate)}
            </Title>
          )}
        </div>
      </Table.Cell>
      <Table.Cell>
        <Table.CellText variant="strong">
          {clientDisplayName(item.client)}
        </Table.CellText>
      </Table.Cell>
      <Table.Cell>
        <div className="flex flex-col">
          <Table.CellText>{item.reason}</Table.CellText>
          {/* Encerrado: o que foi conversado (ou por que não aconteceu) é o
              que se procura ao reler a lista. */}
          {!open && item.outcome && (
            <Table.CellText variant="dim">{item.outcome}</Table.CellText>
          )}
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="flex flex-col items-start gap-2">
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
          {item.rescheduleCount > 0 && (
            <Table.CellText variant="dim">
              {item.rescheduleCount === 1
                ? "reagendado 1 vez"
                : `reagendado ${item.rescheduleCount} vezes`}
            </Table.CellText>
          )}
        </div>
      </Table.Cell>
      {showResponsible && (
        <Table.Cell>
          <Table.CellText variant="dim">
            {responsibleName(item.responsible)}
          </Table.CellText>
        </Table.Cell>
      )}
    </Table.Row>
  );
}
