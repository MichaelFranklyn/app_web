"use client";

import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { QueryError } from "@/components/QueryError";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useTableData } from "@/hooks/useTableData";
import { clientName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";
import { Store } from "lucide-react";

import { CLIENT_COLUMN_HELP, STORE_COLUMN_HELP } from "../../../../help";
import { formatCity } from "../../../../utils";
import { NetworkStore, NetworkStoresData } from "../../interface";

interface Props {
  table: ReturnType<typeof useTableData<NetworkStoresData, NetworkStore>>;
  stores: NetworkStore[];
}

const COLUMNS = 5;

export function NetworkStoresTable({ table, stores }: Props) {
  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Lojas da rede</Table.CardHead.Title>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            {/* Nenhuma ordena: são as mesmas colunas da carteira, mas aqui a
                lista é um recorte por `network_id` e as três computadas
                (vendedor, última compra) não existem como coluna para o banco
                ordenar. Ordenar só a página aberta seria pior que não ordenar. */}
            <Table.Head title={STORE_COLUMN_HELP.store}>Loja</Table.Head>
            <Table.Head title={CLIENT_COLUMN_HELP.city}>Cidade</Table.Head>
            <Table.Head title={STORE_COLUMN_HELP.segment}>Segmento</Table.Head>
            <Table.Head title={CLIENT_COLUMN_HELP.seller}>Vendedor</Table.Head>
            <Table.Head title={CLIENT_COLUMN_HELP.lastOrder}>
              Última compra
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {table.loading && stores.length === 0 ? (
            <Table.Skeleton columns={COLUMNS} rows={5} />
          ) : table.error && stores.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <QueryError flat onRetry={() => table.refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : stores.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={COLUMNS}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Store size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhuma loja nesta rede</EmptyState.Title>
                  <EmptyState.Description>
                    Abra a ficha de um cliente na carteira e escolha esta rede
                    para ele aparecer aqui.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            stores.map((store) => (
              <Table.Row
                key={store.id}
                href={
                  store.companyClient
                    ? `/clients/${store.companyClient.id}`
                    : undefined
                }
              >
                {/* Identidade numa coluna só: nome em cima, CNPJ embaixo — a
                    tabela não pode rolar na horizontal. */}
                <Table.Cell variant="strong">
                  <div className="flex max-w-72 flex-col">
                    <span className="truncate">{clientName(store)}</span>
                    <Title variant="caption" color="muted">
                      {store.cnpj}
                    </Title>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {formatCity(store.addressCity, store.addressState)}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {store.companyClient?.segment?.name ?? "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {store.companyClient?.sellers
                      ?.map((seller) => seller.name)
                      .join(", ") || "—"}
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell>
                  <Table.CellText variant="dim">
                    {store.companyClient?.lastOrderDate
                      ? formatDate(store.companyClient.lastOrderDate)
                      : "—"}
                  </Table.CellText>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>

      <Table.Footer>
        <Table.Footer.Info>
          {table.loading && stores.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {table.totalItems > 0
            ? `${table.totalItems} loja(s) · página ${table.currentPage} de ${table.totalPages}`
            : "Nenhuma loja encontrada"}
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
