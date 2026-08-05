"use client";

import {
  orderStatusLabel,
  orderStatusTone,
} from "@/app/(inside)/_shared/orderStatus";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Send } from "lucide-react";

import { SentOrder } from "../../interface";
import { isPendingAtFactory, summarizeSentOrders } from "../../utils";

interface Props {
  items: SentOrder[];
  loading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
}

export function SentOrdersTable({
  items,
  loading,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}: Props) {
  const page = summarizeSentOrders(items);

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>
          Pedidos colocados na fábrica
        </Table.CardHead.Title>
        <Table.CardHead.Description>
          Pela data do pedido. Quem ainda não tem faturamento está esperando a
          fábrica.
        </Table.CardHead.Description>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Data do pedido</Table.Head>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Situação</Table.Head>
            <Table.Head>Faturamento</Table.Head>
            <Table.Head>Valor</Table.Head>
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
                    <Send size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nenhum pedido enviado no período
                  </EmptyState.Title>
                  <EmptyState.Description>
                    Orçamento ainda não conta aqui: só entra o pedido confirmado
                    em diante.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((order) => (
              <Table.Row key={order.id} href={`/orders/${order.id}`}>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {formatDateDMY(order.orderDate)}
                </Table.Cell>
                <Table.Cell
                  variant="strong"
                  className="max-w-[220px] truncate"
                  title={clientName(order.client)}
                >
                  <span className="inline-flex items-center gap-6">
                    {clientName(order.client)}
                    {order.isDeliveryOverdue && (
                      <Badge.Root color="red" appearance="tinted">
                        <Badge.Text>Entrega atrasada</Badge.Text>
                      </Badge.Root>
                    )}
                  </span>
                </Table.Cell>
                <Table.Cell
                  variant="dim"
                  className="max-w-[180px] truncate"
                  title={factoryName(order.factory)}
                >
                  {factoryName(order.factory)}
                </Table.Cell>
                <Table.Cell variant="dim">
                  {order.seller?.name ?? "—"}
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={orderStatusTone(order.status)}
                    appearance="tinted"
                  >
                    <Badge.Text>{orderStatusLabel(order.status)}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
                {/* "Aguardando" em vez de traço: aqui a ausência de data é o
                    assunto do relatório, não um dado que faltou preencher. */}
                <Table.Cell
                  variant={isPendingAtFactory(order) ? "default" : "dim"}
                  className="whitespace-nowrap"
                >
                  {order.invoicedAt ? (
                    formatDateDMY(order.invoicedAt)
                  ) : (
                    <Badge.Root color="amber" appearance="tinted">
                      <Badge.Text>Aguardando</Badge.Text>
                    </Badge.Root>
                  )}
                </Table.Cell>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {formatMoney(order.totalAmount)}
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
          {/* Sem linhas quem fala é o estado vazio, não o rodapé. */}
          {totalItems > 0 &&
            `${totalItems} pedidos · página ${currentPage} de ${totalPages} · nesta página: ${formatMoney(page.amount)}, ${page.pendingCount} aguardando`}
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
