"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { FilterField, Filters } from "@/components/Filters";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Receipt } from "lucide-react";
import { Order } from "../../interface";
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE } from "../../utils";
import { clientName, factoryName } from "@/utils/company";

interface Props {
  items: Order[];
  loading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  /** Valores dos filtros ativos (vêm da URL, via useTableData). */
  inputValues: Record<string, string>;
  /** Aplica várias chaves de uma vez — o período mexe nas duas pontas. */
  setFilters: (patch: Record<string, string | undefined>) => void;
  /** Campos do painel "Filtros" (vendedor, fábrica, cliente, datas). */
  filterFields: FilterField[];
  /** Título do card — muda por aba (todos × aguardando faturamento). */
  title?: string;
  /** O que dizer quando a lista vem vazia, também por aba. */
  emptyTitle?: string;
  emptyDescription?: string;
}

export function OrdersTable({
  items,
  loading,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  inputValues,
  setFilters,
  filterFields,
  title = "Lista de pedidos",
  emptyTitle = "Nenhum pedido encontrado",
  emptyDescription = 'Use "Novo pedido" para registrar o primeiro pedido.',
}: Props) {
  return (
    <Table.Root data-tour="orders-table">
      <Table.CardHead>
        <Table.CardHead.Title>{title}</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Filters
            fields={filterFields}
            values={inputValues}
            onChange={setFilters}
            data-tour="orders-filters"
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
            <Table.Head>Situação</Table.Head>
            <Table.Head>Valor</Table.Head>
            <Table.Head>Comissão</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={8} rows={8} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={8}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Receipt size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>{emptyTitle}</EmptyState.Title>
                  <EmptyState.Description>
                    {emptyDescription}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((order) => (
              <Table.Row
                key={order.id}
                href={`/orders/${order.id}`}
                data-tour="orders-row"
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
                  <span className="inline-flex items-center gap-6">
                    {clientName(order.client)}
                    {order.isDeliveryOverdue && (
                      <Badge.Root color="red" appearance="tinted">
                        <Badge.Text>Entrega atrasada</Badge.Text>
                      </Badge.Root>
                    )}
                  </span>
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

                <Table.Cell>
                  <Badge.Root
                    color={ORDER_STATUS_TONE[order.status]}
                    appearance="tinted"
                  >
                    <Badge.Text>{ORDER_STATUS_LABELS[order.status]}</Badge.Text>
                  </Badge.Root>
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
