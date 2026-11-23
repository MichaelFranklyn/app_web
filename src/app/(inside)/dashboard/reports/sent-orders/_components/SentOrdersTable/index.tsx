"use client";

import {
  orderStatusLabel,
  orderStatusTone,
} from "@/app/(inside)/_shared/orderStatus";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { FilterField, Filters } from "@/components/Filters";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table, TableSort } from "@/components/Table";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { plural } from "@/utils/format/plural";
import { Send } from "lucide-react";

import { SentOrder } from "../../interface";
import { isPendingAtFactory, summarizeSentOrders } from "../../utils";

interface Props {
  items: SentOrder[];
  loading: boolean;
  /** Campos do painel: busca livre e situação. */
  filterFields: FilterField[];
  inputValues: Record<string, string>;
  setFilter: (key: string, value: string | undefined) => void;
  setFilters: (patch: Record<string, string | undefined>) => void;
  sort: TableSort;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  /** Coluna Vendedor só para quem vê mais de um vendedor. */
  showSeller: boolean;
}

export function SentOrdersTable({
  items,
  loading,
  filterFields,
  inputValues,
  setFilter,
  setFilters,
  sort,
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
  showSeller,
}: Props) {
  const columns = showSeller ? 7 : 6;
  const page = summarizeSentOrders(items);
  const isNarrowed = Object.values(inputValues).some(Boolean);

  return (
    <Table.Root sort={sort}>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Pedidos colocados na fábrica
          <HelpTooltip
            label="Sobre os pedidos colocados"
            content="Pela data do PEDIDO. Quem ainda não tem faturamento está esperando a fábrica — é o que este papel serve para cobrar."
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Filters
            resultCount={totalItems}
            resultLoading={loading}
            fields={filterFields}
            values={inputValues}
            onChange={setFilters}
            onTextChange={setFilter}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      {/* Abaixo do desktop cada pedido vira um cartão, em vez de rolar. */}
      <Table.Table cards>
        <Table.Header>
          <Table.Row>
            <Table.Head sortKey="order_date" sortFirst="desc">
              Data do pedido
            </Table.Head>
            {/* Cliente, fábrica e vendedor não ordenam: em `orders` são só o
                UUID da chave estrangeira. */}
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            {showSeller && <Table.Head>Vendedor</Table.Head>}
            <Table.Head sortKey="status">Situação</Table.Head>
            <Table.Head sortKey="invoiced_at" sortFirst="desc">
              Faturamento
            </Table.Head>
            <Table.Head sortKey="total_amount" sortFirst="desc">
              Valor
            </Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={columns} rows={8} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns}>
                <EmptyState.Root flat>
                  <EmptyState.Icon>
                    <Send size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    {isNarrowed
                      ? "Nenhum pedido com esses filtros"
                      : "Nenhum pedido enviado no período"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {isNarrowed
                      ? "A busca cobre fábrica, vendedor e código do pedido — não o nome do cliente."
                      : "Orçamento ainda não conta aqui: só entra o pedido confirmado em diante."}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((order) => (
              <Table.Row key={order.id} href={`/orders/${order.id}`}>
                <Table.Cell
                  variant="strong"
                  className="whitespace-nowrap"
                  label="Data do pedido"
                >
                  {formatDateDMY(order.orderDate)}
                </Table.Cell>
                <Table.Cell
                  variant="strong"
                  title={clientName(order.client)}
                  wrap
                  card="title"
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
                  title={factoryName(order.factory)}
                  label="Fábrica"
                >
                  {factoryName(order.factory)}
                </Table.Cell>
                {showSeller && (
                  <Table.Cell
                    variant="dim"
                    label="Vendedor"
                    emptyText="Sem vendedor"
                  >
                    {order.seller?.name ?? ""}
                  </Table.Cell>
                )}
                <Table.Cell card="status">
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
                  label="Faturamento"
                >
                  {order.invoicedAt ? (
                    formatDateDMY(order.invoicedAt)
                  ) : (
                    <Badge.Root color="warning" appearance="tinted">
                      <Badge.Text>Aguardando</Badge.Text>
                    </Badge.Root>
                  )}
                </Table.Cell>
                <Table.Cell
                  variant="strong"
                  className="whitespace-nowrap"
                  card="value"
                >
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
            `${plural(totalItems, "pedido", "pedidos")} · página ${currentPage} de ${totalPages} · nesta página: ${formatMoney(page.amount)}, ${page.pendingCount} aguardando`}
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
