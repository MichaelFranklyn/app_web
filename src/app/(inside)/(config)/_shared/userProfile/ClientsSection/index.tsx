"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Filters } from "@/components/Filters";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { priorityMeta } from "@/utils/clientPriority";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY } from "@/utils/format/masks";
import { Users } from "lucide-react";

import { AddWalletClientModal } from "./AddWalletClientModal";
import { WALLET_COLUMN_HELP } from "./help";
import { useWalletTable } from "./useWalletTable";

interface Props {
  sellerId: string;
}

/**
 * A carteira da pessoa: página, ordem e filtros resolvidos no BANCO.
 *
 * Mostrava 50 vínculos numa tabela sem fim nem busca — numa carteira real (as
 * de produção passam de 50) o que ficasse fora dessas linhas não tinha como ser
 * alcançado. Ver `useWalletTable`.
 */
export function ClientsSection({ sellerId }: Props) {
  const table = useWalletTable(sellerId);
  const { displayedData: items, loading, error, refetch } = table;
  const isNarrowed = Object.values(table.inputValues).some(Boolean);

  return (
    <Table.Root sort={table.sort}>
      <Table.CardHead>
        <Table.CardHead.Title>Carteira de clientes</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Filters
            fields={table.filterFields}
            values={table.inputValues}
            onChange={table.setFilters}
            onTextChange={table.setFilter}
          />
          <AddWalletClientModal sellerId={sellerId} onAdded={() => refetch()} />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sortKey="client_name" title={WALLET_COLUMN_HELP.client}>
              Cliente
            </Table.Head>
            <Table.Head title={WALLET_COLUMN_HELP.factory}>Fábrica</Table.Head>
            <Table.Head title={WALLET_COLUMN_HELP.priority}>
              Prioridade
            </Table.Head>
            <Table.Head
              sortKey="visit_frequency_days"
              title={WALLET_COLUMN_HELP.frequency}
            >
              Frequência de visita
            </Table.Head>
            <Table.Head
              sortKey="last_visit_date"
              sortFirst="desc"
              title={WALLET_COLUMN_HELP.lastVisit}
            >
              Última visita
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={5} rows={5} />
          ) : error && items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Users size={32} />
                  </EmptyState.Icon>
                  {/* "Não tem cliente" e "o filtro não achou" pedem saídas
                      diferentes: uma manda cadastrar, a outra manda afrouxar. */}
                  <EmptyState.Title>
                    {isNarrowed
                      ? "Nenhum cliente encontrado"
                      : "Nenhum cliente atribuído"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {isNarrowed
                      ? "Ajuste os filtros para encontrar o cliente."
                      : 'Use "Adicionar cliente" para montar a carteira desta pessoa.'}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((node) => {
              const priority = priorityMeta(node.priority);
              return (
                <Table.Row key={node.id}>
                  <Table.Cell>
                    <Table.CellText variant="strong">
                      {clientName(node.client)}
                    </Table.CellText>
                  </Table.Cell>
                  <Table.Cell>
                    <Table.CellText variant="dim">
                      {factoryName(node.factory)}
                    </Table.CellText>
                  </Table.Cell>
                  <Table.Cell>
                    {/* Vínculo sem prioridade é o caso comum (o motor decide
                        pelo comportamento de compra): um travessão solto lê
                        melhor do que uma etiqueta vazia repetida linha a linha. */}
                    {node.priority ? (
                      <Badge.Root color={priority.color} appearance="tinted">
                        <Badge.Text>{priority.label}</Badge.Text>
                      </Badge.Root>
                    ) : (
                      <Table.CellText variant="dim">—</Table.CellText>
                    )}
                  </Table.Cell>
                  <Table.Cell>
                    <Table.CellText variant="dim">
                      {node.visitFrequencyDays
                        ? `A cada ${node.visitFrequencyDays} dias`
                        : "—"}
                    </Table.CellText>
                  </Table.Cell>
                  <Table.Cell>
                    <Table.CellText variant="dim">
                      {formatDateDMY(node.lastVisitDate ?? undefined)}
                    </Table.CellText>
                  </Table.Cell>
                </Table.Row>
              );
            })
          )}
        </Table.Body>
      </Table.Table>

      <Table.Footer>
        <Table.Footer.Info>
          {loading && items.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {table.totalItems > 0
            ? `${table.totalItems} cliente(s) · página ${table.currentPage} de ${table.totalPages}`
            : "Nenhum cliente encontrado"}
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
