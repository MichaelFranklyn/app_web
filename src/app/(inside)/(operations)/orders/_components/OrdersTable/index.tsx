"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { FilterField, Filters } from "@/components/Filters";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table, TableSort } from "@/components/Table";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Receipt } from "lucide-react";
import { ORDER_COLUMN_HELP } from "../../help";
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
  /** Uma chave só, com o debounce do campo — é o caminho do texto digitado. */
  setFilter: (key: string, value: string | undefined) => void;
  /** Campos do painel "Filtros" (vendedor, fábrica, cliente, datas). */
  filterFields: FilterField[];
  /** Ordenação da lista — vem do `useTableData` e desce até cada cabeçalho. */
  sort: TableSort;
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
  setFilter,
  sort,
  filterFields,
  title = "Lista de pedidos",
  emptyTitle = "Nenhum pedido encontrado",
  emptyDescription = 'Use "Novo pedido" para registrar o primeiro pedido.',
}: Props) {
  return (
    <Table.Root sort={sort} data-tour="orders-table">
      <Table.CardHead>
        <Table.CardHead.Title>{title}</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Filters
            fields={filterFields}
            values={inputValues}
            onChange={setFilters}
            // Sem isto, cada tecla do código do pedido viraria uma consulta ao
            // backend e uma entrada no histórico do navegador.
            onTextChange={setFilter}
            data-tour="orders-filters"
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            {/* Só "Pedido" não ordena: o código é o prefixo do id, e uma
                lista em ordem de UUID não responde pergunta nenhuma. Cliente,
                fábrica e vendedor ordenam pelo NOME — quem faz o ORDER BY
                alcançar a tabela vizinha é o repositório de pedidos.

                A explicação de cada coluna vai no `title` do cabeçalho — o
                cabeçalho ordenável é um `<button>`, e um botão de ajuda dentro
                dele seria HTML inválido. */}
            <Table.Head title={ORDER_COLUMN_HELP.code}>Pedido</Table.Head>
            <Table.Head sortKey="client_name" title={ORDER_COLUMN_HELP.client}>
              Cliente
            </Table.Head>
            <Table.Head
              sortKey="factory_name"
              title={ORDER_COLUMN_HELP.factory}
            >
              Fábrica
            </Table.Head>
            <Table.Head sortKey="seller_name" title={ORDER_COLUMN_HELP.seller}>
              Vendedor
            </Table.Head>
            <Table.Head
              sortKey="order_date"
              sortFirst="desc"
              title={ORDER_COLUMN_HELP.date}
            >
              Data do pedido
            </Table.Head>
            <Table.Head sortKey="status" title={ORDER_COLUMN_HELP.status}>
              Situação
            </Table.Head>
            <Table.Head
              sortKey="total_amount"
              sortFirst="desc"
              align="right"
              title={ORDER_COLUMN_HELP.amount}
            >
              {/* "Valor" sozinho prometia o total do pedido e entregava a
                  mercadoria: no detalhe o mesmo pedido aparecia maior, com IPI
                  e imposto embutido. O rótulo diz qual das duas bases é esta. */}
              Valor (sem impostos)
            </Table.Head>
            <Table.Head
              sortKey="commission_amount"
              sortFirst="desc"
              align="right"
              title={ORDER_COLUMN_HELP.commission}
            >
              Comissão
            </Table.Head>
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

                <Table.Cell variant="dim" className="whitespace-nowrap">
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

                <Table.Cell variant="strong" align="right">
                  {formatMoney(order.totalAmount)}
                </Table.Cell>

                <Table.Cell variant="dim" align="right">
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
