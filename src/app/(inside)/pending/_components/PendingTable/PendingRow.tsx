"use client";

import { Badge } from "@/components/Badges";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";

import { PendingItem } from "../../interface";
import {
  clientDetail,
  dueLabel,
  dueTone,
  PENDING_PRIORITY_COLOR,
  PENDING_PRIORITY_LABEL,
  PENDING_TYPE_SINGULAR,
  priorityHint,
  reasonText,
} from "../../utils";
import { PendingActions } from "../PendingActions";

interface Props {
  item: PendingItem;
  showSeller: boolean;
  onScheduleReturn?: (item: PendingItem) => void;
}

/**
 * Uma pendência. A linha inteira leva aonde ela se resolve (`item.link`); a
 * coluna Ação escreve para onde, com os atalhos de cada tipo ao lado.
 */
export function PendingRow({ item, showSeller, onScheduleReturn }: Props) {
  const detail = clientDetail(item);

  return (
    <Table.Row href={item.link ?? undefined}>
      <Table.Cell>
        <Badge.Root
          color={PENDING_PRIORITY_COLOR[item.priority]}
          appearance="tinted"
          size="sm"
          title={priorityHint(item)}
        >
          <Badge.Text>{PENDING_PRIORITY_LABEL[item.priority]}</Badge.Text>
        </Badge.Root>
      </Table.Cell>
      <Table.Cell>
        <div className="flex flex-col">
          <Table.CellText variant="strong">
            {PENDING_TYPE_SINGULAR[item.type]}
          </Table.CellText>
          {/* A explicação curta, sem abrir outra tela: a conta que fez disto
              uma pendência. */}
          <Table.CellText variant="dim">{reasonText(item)}</Table.CellText>
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="flex flex-col">
          <Table.CellText variant="strong">{item.clientName}</Table.CellText>
          {detail && <Table.CellText variant="dim">{detail}</Table.CellText>}
          {showSeller && (
            <Table.CellText variant="dim">
              {item.sellerName ?? "sem responsável único"}
            </Table.CellText>
          )}
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="flex flex-col">
          {item.dueDate && (
            <Table.CellText>{formatDate(item.dueDate)}</Table.CellText>
          )}
          <Title variant="body-xs" color={dueTone(item.daysLate)}>
            {dueLabel(item.daysLate)}
          </Title>
        </div>
      </Table.Cell>
      <Table.Cell>
        <PendingActions item={item} onScheduleReturn={onScheduleReturn} />
      </Table.Cell>
    </Table.Row>
  );
}
