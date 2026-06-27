"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { InputSearch } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Receipt } from "lucide-react";
import { Order } from "../../interface";
import { clientName, factoryName } from "@/utils/company";

interface Props {
  items: Order[];
  loading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
}

export function OrdersTable({
  items,
  loading,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  inputValues,
  setFilter,
}: Props) {
  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Lista de pedidos</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <InputSearch
            placeholder="Buscar por fábrica, vendedor ou código..."
            value={inputValues.search ?? ""}
            onChange={(e) => setFilter("search", e.target.value || undefined)}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Pedido</Table.Head>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Data</Table.Head>
            <Table.Head>Valor</Table.Head>
            <Table.Head>Comissão</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={7} rows={8} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={7}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Receipt size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum pedido encontrado</EmptyState.Title>
                  <EmptyState.Description>
                    Use &quot;Novo pedido&quot; para registrar o primeiro
                    pedido.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((order) => (
              <Table.Row
                key={order.id}
                href={`/orders/${order.id}`}
                className="group"
              >
                <Table.Cell>
                  <Badge.Root color="subtle" appearance="tinted">
                    <Badge.Text>
                      {order.id.slice(0, 8).toUpperCase()}
                    </Badge.Text>
                  </Badge.Root>
                </Table.Cell>

                <Table.Cell variant="strong">
                  {clientName(order.client)}
                </Table.Cell>

                <Table.Cell variant="dim">
                  {factoryName(order.factory)}
                </Table.Cell>

                <Table.Cell variant="dim">
                  {order.seller?.name ?? "—"}
                </Table.Cell>

                <Table.Cell variant="dim">
                  {formatDateDMY(order.orderDate)}
                </Table.Cell>

                <Table.Cell variant="strong">
                  {formatMoney(order.totalAmount)}
                </Table.Cell>

                <Table.Cell variant="dim">
                  {formatMoney(order.commissionAmount)}
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>

      <Table.Footer>
        <Table.Footer.Info>
          {loading && items.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {totalItems > 0
            ? `${totalItems} pedidos · página ${currentPage} de ${totalPages}`
            : "Nenhum pedido encontrado"}
        </Table.Footer.Info>

        <Pagination.Smart
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </Table.Footer>
    </Table.Root>
  );
}
