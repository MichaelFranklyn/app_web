"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { useQuery } from "@apollo/client/react";

import { MatchOption } from "../../../interface";
import { ORDER_PDF_IMPORT_BATCHES_QUERY } from "../../gql";
import { PdfImportBatchesResponse } from "../../interface";
import { batchBadge, batchCounts, batchOpenedAt } from "../../utils";

const COLUMNS = 6;

interface Props {
  currentBatchId: string | null;
  /** Para dar nome ao vendedor do lote (o lote só guarda o id). */
  sellerOptions: MatchOption[];
  onOpen: (id: string) => void;
  disabled: boolean;
}

/**
 * Lotes de PDFs já abertos, mais recentes primeiro: dá para voltar a um lote
 * e terminar de enviar ou importar. Some enquanto não há nenhum.
 */
export function PdfBatchesCard({
  currentBatchId,
  sellerOptions,
  onOpen,
  disabled,
}: Props) {
  const { data, loading, error, refetch } = useQuery<PdfImportBatchesResponse>(
    ORDER_PDF_IMPORT_BATCHES_QUERY,
    { fetchPolicy: "cache-and-network" }
  );
  const payload = data?.orderPdfImportBatches;
  const batches = payload?.status ? (payload.data ?? []) : [];
  const failed = error ?? (payload && !payload.status);

  if (!loading && !failed && batches.length === 0) return null;

  const sellerName = (id: string | null) =>
    id
      ? (sellerOptions.find((o) => o.id === id)?.label ?? "Vendedor removido")
      : "O de cada cliente";

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
            <Table.Head>Vendedor</Table.Head>
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
            batches.map((batch) => {
              const badge = batchBadge(batch);
              const isCurrent = batch.id === currentBatchId;
              return (
                <Table.Row key={batch.id}>
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
                  {/* Com hora e vendedor: dois lotes da mesma fábrica no mesmo
                      dia eram cartões idênticos (crítica de configurações,
                      23/11/2026). */}
                  <Table.Cell label="Aberto em" variant="dim">
                    {batchOpenedAt(batch.createdAt)}
                  </Table.Cell>
                  <Table.Cell label="Vendedor" variant="dim">
                    {sellerName(batch.sellerId)}
                  </Table.Cell>
                  <Table.Cell label="PDFs" variant="dim" wrap>
                    {batchCounts(batch)}
                  </Table.Cell>
                  <Table.Cell card="actions" align="right">
                    {isCurrent ? (
                      <Table.CellText variant="dim">
                        Aberto agora
                      </Table.CellText>
                    ) : (
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
              );
            })
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
