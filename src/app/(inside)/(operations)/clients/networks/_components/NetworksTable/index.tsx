"use client";

import { EmptyState } from "@/components/EmptyState";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { UseOptimisticListReturn } from "@/hooks/useOptimisticList";
import { useTableData } from "@/hooks/useTableData";
import { formatDate } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { Network } from "lucide-react";

import { ClientNetwork, ClientNetworksData } from "../../interface";
import { DeleteNetworkModal } from "./DeleteNetworkModal";
import { EditNetworkModal } from "./EditNetworkModal";

interface Props {
  table: ReturnType<typeof useTableData<ClientNetworksData, ClientNetwork>>;
  networks: ClientNetwork[];
  optimistic: UseOptimisticListReturn<ClientNetwork>;
  onChanged: () => void;
}

const COLUMNS = 5;

export function NetworksTable({
  table,
  networks,
  optimistic,
  onChanged,
}: Props) {
  const search = table.inputValues.search ?? "";

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Redes</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <InputSearch
            size="sm"
            containerClassName="w-72"
            placeholder="Buscar rede..."
            value={search}
            onChange={(e) => table.setFilter("search", e.target.value)}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Rede</Table.Head>
            <Table.Head>Lojas</Table.Head>
            <Table.Head>Faturamento</Table.Head>
            <Table.Head>Último pedido</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {table.loading && networks.length === 0 ? (
            <Table.Skeleton columns={COLUMNS} rows={5} />
          ) : table.error && networks.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <QueryError flat onRetry={() => table.refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : networks.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Network size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {search.trim()
                      ? "Nenhuma rede encontrada"
                      : "Nenhuma rede cadastrada"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {search.trim()
                      ? "Ajuste a busca ou cadastre uma nova rede."
                      : 'Use "Nova rede" para reunir as lojas de um mesmo grupo e acompanhar todas de uma vez.'}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            networks.map((network) => (
              <Table.Row
                key={network.id}
                href={`/clients/networks/${network.id}`}
              >
                <Table.Cell variant="strong">{network.name}</Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {network.storeCount === 1
                      ? "1 loja"
                      : `${network.storeCount} lojas`}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell variant="strong">
                  {formatMoney(network.invoicedAmount)}
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {network.lastOrderDate
                      ? formatDate(network.lastOrderDate)
                      : "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    <EditNetworkModal
                      network={network}
                      onUpdateOptimistic={optimistic.updateOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                      onChanged={onChanged}
                    />
                    <DeleteNetworkModal
                      network={network}
                      onRemoveOptimistic={optimistic.removeOptimistic}
                      onCommit={optimistic.commit}
                      onRollback={optimistic.rollback}
                      onChanged={onChanged}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>

      <Table.Footer>
        <Table.Footer.Info>
          {table.loading && networks.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {table.totalItems > 0
            ? `${table.totalItems} rede(s) · página ${table.currentPage} de ${table.totalPages}`
            : "Nenhuma rede encontrada"}
        </Table.Footer.Info>

        <Pagination.Smart
          currentPage={table.currentPage}
          totalPages={table.totalPages}
          onPageChange={table.setCurrentPage}
        />
      </Table.Footer>
    </Table.Root>
  );
}
