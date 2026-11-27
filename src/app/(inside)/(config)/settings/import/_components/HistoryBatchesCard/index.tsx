"use client";

import { Button } from "@/components/Button";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { Tooltip } from "@/components/Tooltip";
import { formatDateDMY } from "@/utils/format/masks";
import { plural } from "@/utils/format/plural";
import { useQuery } from "@apollo/client/react";
import { ListOrdered, Users } from "lucide-react";

import { HISTORY_IMPORT_BATCHES_QUERY } from "../../gql";
import {
  HistoryImportBatch,
  HistoryImportBatchesResponse,
} from "../../interface";
import { UndoBatchModal } from "./UndoBatchModal";

const COLUMNS = 4;

/**
 * Importações de histórico já feitas, mais recentes primeiro, com "Ver
 * pedidos" (a lista de pedidos só daquele lote), "Ver clientes novos" (os que
 * o lote pôs na carteira) e "Desfazer" nas que ainda
 * valem. Planilha errada se corrige desfazendo o lote e
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
                  {batchCounts(batch)}
                </Table.Cell>
                <Table.Cell label="Situação" variant="dim" wrap>
                  {situation(batch)}
                </Table.Cell>
                <Table.Cell card="actions" align="right">
                  {!batch.undoneAt && (
                    <div className="flex flex-wrap justify-end gap-8">
                      {batch.ordersCount > 0 && (
                        // Mesmos nomes de `IMPORT_BATCH_PARAM`/`IMPORT_DATE_PARAM`
                        // em /orders (não se importa código de outra página).
                        <Tooltip
                          content="Abre a lista de pedidos só com os que vieram nesta importação."
                          className="max-w-[min(320px,calc(100vw-20px))] whitespace-normal"
                        >
                          <Button.Link
                            href={`/orders?importBatch=${batch.id}&importedAt=${encodeURIComponent(batch.createdAt)}`}
                            appearance="ghost"
                            size="sm"
                          >
                            <Button.Icon icon={ListOrdered} />
                            <Button.Title>Ver pedidos</Button.Title>
                          </Button.Link>
                        </Tooltip>
                      )}
                      {batch.clientsCount > 0 && (
                        // Mesmos nomes de parâmetro que /orders, lidos em /clients.
                        <Tooltip
                          content="Abre a carteira só com os clientes que esta importação adicionou."
                          className="max-w-[min(320px,calc(100vw-20px))] whitespace-normal"
                        >
                          <Button.Link
                            href={`/clients?importBatch=${batch.id}&importedAt=${encodeURIComponent(batch.createdAt)}`}
                            appearance="ghost"
                            size="sm"
                          >
                            <Button.Icon icon={Users} />
                            <Button.Title>Ver clientes novos</Button.Title>
                          </Button.Link>
                        </Tooltip>
                      )}
                      <UndoBatchModal
                        batch={batch}
                        onUndone={() => refetch()}
                      />
                    </div>
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

function batchCounts(batch: HistoryImportBatch): string {
  const parts = [
    plural(batch.ordersCount, "pedido", "pedidos"),
    plural(batch.itemsCount, "item", "itens"),
  ];
  if (batch.clientsCount > 0) {
    parts.push(plural(batch.clientsCount, "cliente novo", "clientes novos"));
  }
  return parts.join(" · ");
}

function situation(batch: HistoryImportBatch): string {
  if (!batch.undoneAt) return "Em vigor";
  const who = batch.undoneByEmail ? ` por ${batch.undoneByEmail}` : "";
  const why = batch.undoReason ? ` · ${batch.undoReason}` : "";
  const clients =
    batch.clientsUndone > 0
      ? ` · ${plural(batch.clientsUndone, "cliente saiu", "clientes saíram")} da carteira`
      : "";
  return `Desfeita em ${formatDateDMY(batch.undoneAt)}${who}${clients}${why}`;
}
