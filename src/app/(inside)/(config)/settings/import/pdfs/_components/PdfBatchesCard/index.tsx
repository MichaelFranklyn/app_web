"use client";

import { Button } from "@/components/Button";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { formatDateDMY } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";

import { ORDER_PDF_IMPORT_BATCHES_QUERY } from "../../gql";
import { PdfImportBatch, PdfImportBatchesResponse } from "../../interface";

const COLUMNS = 4;

interface Props {
  currentBatchId: string | null;
  onOpen: (id: string) => void;
  disabled: boolean;
}

/**
 * Lotes de PDFs já abertos, mais recentes primeiro: dá para voltar a um lote
 * e terminar de enviar ou importar. Some enquanto não há nenhum.
 */
export function PdfBatchesCard({ currentBatchId, onOpen, disabled }: Props) {
  const { data, loading, error, refetch } = useQuery<PdfImportBatchesResponse>(
    ORDER_PDF_IMPORT_BATCHES_QUERY,
    { fetchPolicy: "cache-and-network" }
  );
  const payload = data?.orderPdfImportBatches;
  const batches = payload?.status ? (payload.data ?? []) : [];
  const failed = error ?? (payload && !payload.status);

  if (!loading && !failed && batches.length === 0) return null;

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Lotes de PDFs</Table.CardHead.Title>
      </Table.CardHead>
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Aberto em</Table.Head>
            <Table.Head>PDFs</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && batches.length === 0 ? (
            <Table.Skeleton columns={COLUMNS} rows={2} />
          ) : failed && batches.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : (
            batches.map((batch) => (
              <Table.Row key={batch.id}>
                <Table.Cell card="title">
                  <Table.CellText variant="strong">
                    {batch.factoryName}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell label="Aberto em" variant="dim">
                  {formatDateDMY(batch.createdAt)}
                </Table.Cell>
                <Table.Cell label="PDFs" variant="dim" wrap>
                  {counts(batch)}
                </Table.Cell>
                <Table.Cell card="actions" align="right">
                  {batch.id !== currentBatchId && (
                    <Button.Root
                      appearance="outline"
                      color="neutral"
                      size="sm"
                      disabled={disabled}
                      onClick={() => onOpen(batch.id)}
                    >
                      <Button.Title>Abrir</Button.Title>
                    </Button.Root>
                  )}
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}

function counts(batch: PdfImportBatch): string {
  const parts = [`${batch.totalFiles} no lote`];
  if (batch.importedFiles) parts.push(`${batch.importedFiles} importado(s)`);
  if (batch.readFiles) parts.push(`${batch.readFiles} lido(s)`);
  if (batch.failedFiles) parts.push(`${batch.failedFiles} não lido(s)`);
  return parts.join(" · ");
}
