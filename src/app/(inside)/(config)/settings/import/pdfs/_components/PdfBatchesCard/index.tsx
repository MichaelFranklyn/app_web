"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { useQuery } from "@apollo/client/react";
import { FileText } from "lucide-react";

import { ORDER_PDF_IMPORT_BATCHES_QUERY } from "../../gql";
import { PdfImportBatchesResponse } from "../../interface";
import {
  batchBadge,
  batchCounts,
  batchOpenedAt,
  pdfBatchPath,
} from "../../utils";
import { PdfBatchRowActions } from "../PdfBatchRowActions";

const COLUMNS = 5;

/**
 * Lotes de PDFs já abertos, mais recentes primeiro: clicar na linha leva ao
 * assistente do lote, para terminar de enviar ou importar; o "⋯" exclui.
 * Vendedor não aparece: ele é escolhido por PDF, na prévia.
 */
export function PdfBatchesCard() {
  const { data, loading, error, refetch } = useQuery<PdfImportBatchesResponse>(
    ORDER_PDF_IMPORT_BATCHES_QUERY,
    { fetchPolicy: "cache-and-network" }
  );
  const payload = data?.orderPdfImportBatches;
  const batches = payload?.status ? (payload.data ?? []) : [];
  const failed = error ?? (payload && !payload.status);

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Lotes de PDFs</Table.CardHead.Title>
      </Table.CardHead>
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Situação</Table.Head>
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
          ) : batches.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <EmptyState.Root flat>
                  <EmptyState.Icon>
                    <FileText />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum lote ainda</EmptyState.Title>
                  <EmptyState.Description>
                    Clique em &quot;Novo lote&quot;, escolha a fábrica e envie
                    os PDFs dos pedidos.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            batches.map((batch) => {
              const badge = batchBadge(batch);
              return (
                <Table.Row key={batch.id} href={pdfBatchPath(batch.id)}>
                  <Table.Cell card="title">
                    <Table.CellText variant="strong">
                      {batch.factoryName}
                    </Table.CellText>
                  </Table.Cell>
                  <Table.Cell card="status">
                    <Badge.Root
                      color={badge.color}
                      appearance="tinted"
                      size="sm"
                    >
                      <Badge.Text>{badge.label}</Badge.Text>
                    </Badge.Root>
                  </Table.Cell>
                  {/* Com hora: dois lotes da mesma fábrica no mesmo dia eram
                      cartões idênticos (crítica de configurações, 23/11/2026). */}
                  <Table.Cell label="Aberto em" variant="dim">
                    {batchOpenedAt(batch.createdAt)}
                  </Table.Cell>
                  <Table.Cell label="PDFs" variant="dim" wrap>
                    {batchCounts(batch)}
                  </Table.Cell>
                  <Table.Cell card="actions" align="right">
                    <PdfBatchRowActions
                      remove={{ batch, onDeleted: () => void refetch() }}
                    />
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
