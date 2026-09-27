"use client";

import { EmptyState } from "@/components/EmptyState";
import { Filters, FilterField } from "@/components/Filters";
import { Input } from "@/components/Input";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table, TableSort } from "@/components/Table";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { PackageCheck } from "lucide-react";

import { ORDER_COLUMN_HELP } from "../../help";
import { Order } from "../../interface";
import { daysSince } from "../../utils";

interface Props {
  items: Order[];
  loading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalItems: number;
  inputValues: Record<string, string>;
  setFilters: (patch: Record<string, string | undefined>) => void;
  setFilter: (key: string, value: string | undefined) => void;
  filterFields: FilterField[];
  sort: TableSort;
  todayIso: string;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  /** Marca/desmarca os pedidos DA PÁGINA — é o que a pessoa está vendo. */
  onTogglePage: () => void;
}

/**
 * Aba "Esperando entrega": faturados com o prazo vencido e sem confirmação.
 * Mostra a entrega PREVISTA — a data que fica gravada se a pessoa confirmar sem
 * informar outra — e deixa marcar vários para confirmar de uma vez.
 */
export function AwaitingDeliveryTable(props: Props) {
  const { items, loading, selectedIds, todayIso } = props;
  const pageSelected =
    items.length > 0 && items.every((o) => selectedIds.has(o.id));

  return (
    <Table.Root sort={props.sort}>
      <Table.CardHead>
        <Table.CardHead.Title>Pedidos esperando entrega</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Filters
            fields={props.filterFields}
            values={props.inputValues}
            onChange={props.setFilters}
            onTextChange={props.setFilter}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-40">
              <Input.Checkbox
                label=""
                aria-label="Selecionar os pedidos desta página"
                checked={pageSelected}
                onChange={props.onTogglePage}
              />
            </Table.Head>
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
              sortKey="invoiced_at"
              title={ORDER_COLUMN_HELP.invoicedAt}
            >
              Faturado em
            </Table.Head>
            <Table.Head title={ORDER_COLUMN_HELP.expectedDelivery}>
              Entrega prevista
            </Table.Head>
            <Table.Head
              sortKey="total_amount"
              sortFirst="desc"
              align="right"
              title={ORDER_COLUMN_HELP.amount}
            >
              Valor (sem impostos)
            </Table.Head>
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
                    <PackageCheck size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhuma entrega atrasada</EmptyState.Title>
                  <EmptyState.Description>
                    Todo pedido faturado com o prazo vencido já teve a entrega
                    confirmada.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((order) => (
              <Table.Row key={order.id} href={`/orders/${order.id}`}>
                <Table.Cell onClick={(e) => e.stopPropagation()}>
                  <Input.Checkbox
                    label=""
                    aria-label={`Selecionar o pedido de ${clientName(order.client)}`}
                    checked={selectedIds.has(order.id)}
                    onChange={() => props.onToggle(order.id)}
                  />
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
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatDateDMY(order.invoicedAt ?? undefined)}
                  {order.invoicedAt && (
                    <Table.CellText variant="dim" className="ml-4">
                      há {daysSince(order.invoicedAt, todayIso)} dias
                    </Table.CellText>
                  )}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatDateDMY(order.expectedDeliveryDate ?? undefined)}
                </Table.Cell>
                <Table.Cell variant="strong" align="right">
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
          {props.totalItems > 0
            ? `${props.totalItems} pedidos · página ${props.currentPage} de ${props.totalPages}`
            : "Nenhum pedido encontrado"}
        </Table.Footer.Info>
        <Pagination.Smart
          currentPage={props.currentPage}
          totalPages={props.totalPages}
          onPageChange={props.setCurrentPage}
        />
      </Table.Footer>
    </Table.Root>
  );
}
