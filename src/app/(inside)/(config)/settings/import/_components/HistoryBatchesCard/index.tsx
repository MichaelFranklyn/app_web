"use client";

import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { formatDateDMY } from "@/utils/format/masks";
import { plural } from "@/utils/format/plural";
import { useQuery } from "@apollo/client/react";

import { HISTORY_IMPORT_BATCHES_QUERY } from "../../gql";
import {
  HistoryImportBatch,
  HistoryImportBatchesResponse,
} from "../../interface";
import { UndoBatchModal } from "./UndoBatchModal";

const COLUMNS = 4;

/**
 * Importações de histórico já feitas, mais recentes primeiro, com "Desfazer"
 * nas que ainda valem. Planilha errada se corrige desfazendo o lote e
 * importando de novo. Some enquanto a empresa nunca importou nada.
 */
export function HistoryBatchesCard() {
  const { data, loading, error, refetch } =
    useQuery<HistoryImportBatchesResponse>(HISTORY_IMPORT_BATCHES_QUERY, {
      fetchPolicy: "cache-and-network",
    });
  const batches = data?.orderHistoryImportBatches ?? [];

  if (!loading && !error && batches.length === 0) return null;

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Importações feitas</Table.CardHead.Title>
      </Table.CardHead>
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head>Quando</Table.Head>
            <Table.Head>Pedidos</Table.Head>
            <Table.Head>Situação</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && batches.length === 0 ? (
            <Table.Skeleton columns={COLUMNS} rows={2} />
          ) : error && batches.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : (
            batches.map((batch) => (
              <Table.Row key={batch.id}>
                <Table.Cell card="title">
                  <div className="flex flex-col items-start gap-2">
                    <Table.CellText variant="strong">
                      {formatDateDMY(batch.createdAt)}
                    </Table.CellText>
                    {batch.createdByEmail && (
                      <Table.CellText variant="dim2">
                        {batch.createdByEmail}
                      </Table.CellText>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell label="Pedidos" variant="dim">
                  {`${plural(batch.ordersCount, "pedido", "pedidos")} · ${plural(batch.itemsCount, "item", "itens")}`}
                </Table.Cell>
                <Table.Cell label="Situação" variant="dim" wrap>
                  {situation(batch)}
                </Table.Cell>
                <Table.Cell card="actions" align="right">
                  {!batch.undoneAt && (
                    <UndoBatchModal batch={batch} onUndone={() => refetch()} />
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

function situation(batch: HistoryImportBatch): string {
  if (!batch.undoneAt) return "Em vigor";
  const who = batch.undoneByEmail ? ` por ${batch.undoneByEmail}` : "";
  const why = batch.undoReason ? ` · ${batch.undoReason}` : "";
  return `Desfeita em ${formatDateDMY(batch.undoneAt)}${who}${why}`;
}
