"use client";

import { Badge } from "@/components/Badges";
import { Input } from "@/components/Input";
import { Table } from "@/components/Table";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import Link from "next/link";

import { NfePreviewRow } from "./interface";
import {
  NFE_STATUS_COLOR,
  NFE_STATUS_LABEL,
  billsSummary,
  isInvoiceable,
  orderLinkFor,
} from "./utils";

interface Props {
  rows: NfePreviewRow[];
  selected: Set<string>;
  onToggle: (fileName: string) => void;
}

/**
 * A prévia, uma linha por arquivo. O link do pedido abre em outra aba: a prévia
 * fica aberta para a pessoa voltar e faturar as outras.
 * O motivo vem escrito embaixo da situação —
 * "conferir no pedido" sem dizer o quê obrigaria a pessoa a adivinhar.
 */
export function NfePreviewList({ rows, selected, onToggle }: Props) {
  return (
    <Table.Root>
      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-40" />
            <Table.Head>Nota</Table.Head>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Valor</Table.Head>
            <Table.Head>Situação</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row) => {
            const link = orderLinkFor(row.status, row.orderId);
            return (
              <Table.Row key={row.fileName}>
                <Table.Cell>
                  {isInvoiceable(row.status) && (
                    <Input.Checkbox
                      label=""
                      aria-label={`Faturar pela nota ${row.invoiceNumber ?? row.fileName}`}
                      checked={selected.has(row.fileName)}
                      onChange={() => onToggle(row.fileName)}
                    />
                  )}
                </Table.Cell>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {row.invoiceNumber ? `Nº ${row.invoiceNumber}` : row.fileName}
                  {row.issuedAt && (
                    <Table.CellText variant="dim" className="ml-4">
                      {formatDateDMY(row.issuedAt)}
                    </Table.CellText>
                  )}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {row.recipientName ?? "—"}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {row.emitterName ?? "—"}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {row.netProductsTotal
                    ? formatMoney(row.netProductsTotal)
                    : "—"}
                  {row.orderTotal && (
                    <Table.CellText variant="dim" className="ml-4">
                      pedido {formatMoney(row.orderTotal)}
                    </Table.CellText>
                  )}
                </Table.Cell>
                {/* A situação quebra linha: o motivo é a frase que diz o que fazer,
                    e cortá-la com a tabela rolando para o lado a escondia. */}
                <Table.Cell className="min-w-[280px] whitespace-normal">
                  <div className="flex flex-col gap-4">
                    <Badge.Root
                      color={NFE_STATUS_COLOR[row.status]}
                      appearance="tinted"
                    >
                      <Badge.Text>{NFE_STATUS_LABEL[row.status]}</Badge.Text>
                    </Badge.Root>
                    {row.reasons.map((reason) => (
                      <Table.CellText key={reason} variant="dim">
                        {reason}
                      </Table.CellText>
                    ))}
                    {/* De onde saem os boletos: é o que vira parcela e, no modo
                        Pagamento, o que libera a comissão. Só importa em
                        quem vai ser faturado. */}
                    {isInvoiceable(row.status) && row.billsNote && (
                      <Table.CellText variant="dim">
                        {row.billsNote}
                        {row.usesInvoiceBills && ` ${billsSummary(row)}`}
                      </Table.CellText>
                    )}
                    {link && (
                      <Link href={link} target="_blank" rel="noreferrer">
                        <Table.CellText variant="dim" className="underline">
                          Abrir o pedido
                        </Table.CellText>
                      </Link>
                    )}
                  </div>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
