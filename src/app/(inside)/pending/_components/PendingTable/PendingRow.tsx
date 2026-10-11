"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { formatDate } from "@/utils/format/date";
import { useRouter } from "next/navigation";

import { PendingItem } from "../../interface";
import {
  clientDetail,
  destinationLabel,
  dueLabel,
  dueTone,
  PENDING_PRIORITY_COLOR,
  PENDING_PRIORITY_LABEL,
  PENDING_TYPE_SINGULAR,
  priorityHint,
  reasonText,
} from "../../utils";

interface Props {
  item: PendingItem;
  showSeller: boolean;
  /** "Volte dia X": agendar o contato já vinculado a este retorno. */
  onScheduleReturn?: (item: PendingItem) => void;
}

/**
 * Uma pendência. A linha inteira leva aonde ela se resolve (`item.link`); o
 * botão "Ver cliente" só aparece quando esse destino NÃO é a ficha do cliente —
 * senão seriam dois caminhos para o mesmo lugar.
 */
export function PendingRow({ item, showSeller, onScheduleReturn }: Props) {
  const router = useRouter();
  const detail = clientDetail(item);
  const clientLink =
    item.clientLink && item.clientLink !== item.link ? item.clientLink : null;

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
          <Table.CellText variant="dim">{reasonText(item)}</Table.CellText>
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="flex flex-col">
          <Table.CellText variant="strong">{item.clientName}</Table.CellText>
          {detail && <Table.CellText variant="dim">{detail}</Table.CellText>}
        </div>
      </Table.Cell>
      <Table.Cell>
        <div className="flex flex-col">
          <Table.CellText>{formatDate(item.dueDate)}</Table.CellText>
          <Title variant="body-xs" color={dueTone(item.daysLate)}>
            {dueLabel(item.daysLate)}
          </Title>
        </div>
      </Table.Cell>
      {showSeller && (
        <Table.Cell>
          <Table.CellText variant="dim">
            {item.sellerName ?? "sem vendedor"}
          </Table.CellText>
        </Table.Cell>
      )}
      <Table.Cell>
        <div className="flex items-center gap-8">
          <Table.CellText variant="dim">
            {destinationLabel(item.type)}
          </Table.CellText>
          {/* O contato agendado daqui nasce vinculado ao retorno: concluí-lo
              resolve o "volte dia X" (um contato qualquer não resolve). */}
          {item.reason === "RETURN_DATE" && onScheduleReturn && (
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="xs"
              noUppercase
              onClick={() => onScheduleReturn(item)}
            >
              <Button.Title>Agendar contato</Button.Title>
            </Button.Root>
          )}
          {clientLink && (
            <Button.Root
              type="button"
              appearance="ghost"
              color="neutral"
              size="xs"
              noUppercase
              onClick={() => router.push(clientLink)}
            >
              <Button.Title>Ver cliente</Button.Title>
            </Button.Root>
          )}
        </div>
      </Table.Cell>
    </Table.Row>
  );
}
