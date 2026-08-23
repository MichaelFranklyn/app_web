"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { FilterField, Filters } from "@/components/Filters";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table, TableSort } from "@/components/Table";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Receipt } from "lucide-react";

import {
  orderStatusLabel,
  orderStatusTone,
} from "@/app/(inside)/_shared/orderStatus";
import { SalesReportOrder } from "../../interface";
import { sumBy } from "../../utils";

interface Props {
  items: SalesReportOrder[];
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
}

/**
 * As linhas do relatório de vendas, uma por pedido faturado.
 *
 * A linha leva ao pedido: conferindo o papel, a pergunta seguinte é sempre "o que
 * tinha nesse pedido". O rodapé soma a PÁGINA à vista, e diz isso — o total do
 * período está nos cartões acima, e um total ambíguo no rodapé faria a pessoa
 * achar que o mês fechou no valor da página.
 */
export function SalesReportTable({
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
}: Props) {
  const pageAmount = sumBy(items, (order) => order.totalAmount);
  const pageCommission = sumBy(items, (order) => order.commissionAmount);
  const isNarrowed = Object.values(inputValues).some(Boolean);

  return (
    <Table.Root sort={sort}>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Pedidos faturados
          <HelpTooltip
            label="Sobre os pedidos faturados"
            content="Recortados pela data em que a FÁBRICA faturou: um pedido de junho faturado em julho é venda de julho."
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Filters
            fields={filterFields}
            values={inputValues}
            onChange={setFilters}
            // A busca vai por aqui para manter o debounce do campo: pelo
            // `onChange` cada tecla viraria uma consulta ao backend.
            onTextChange={setFilter}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head sortKey="invoiced_at" sortFirst="desc">
              Faturamento
            </Table.Head>
            <Table.Head sortKey="order_date" sortFirst="desc">
              Data do pedido
            </Table.Head>
            {/* Cliente, fábrica e vendedor não ordenam: em `orders` são só o
                UUID da chave estrangeira, e o listador genérico não alcança o
                nome na tabela vizinha. */}
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head sortKey="status">Situação</Table.Head>
            <Table.Head sortKey="total_amount" sortFirst="desc">
              Valor
            </Table.Head>
            <Table.Head sortKey="commission_amount" sortFirst="desc">
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
                  <EmptyState.Title>
                    {isNarrowed
                      ? "Nenhum pedido com esses filtros"
                      : "Nenhum faturamento no período"}
                  </EmptyState.Title>
                  <EmptyState.Description>
                    {isNarrowed
                      ? "A busca cobre fábrica, vendedor e código do pedido — não o nome do cliente."
                      : "Só entram aqui os pedidos que a fábrica já faturou. Amplie o período ou confira a aba “Pedidos enviados”."}
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((order) => (
              <Table.Row key={order.id} href={`/orders/${order.id}`}>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {order.invoicedAt ? formatDateDMY(order.invoicedAt) : "—"}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatDateDMY(order.orderDate)}
                </Table.Cell>
                <Table.Cell variant="strong" title={clientName(order.client)}>
                  {clientName(order.client)}
                </Table.Cell>
                <Table.Cell variant="dim" title={factoryName(order.factory)}>
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
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {formatMoney(order.totalAmount)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
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
          {/* Sem linhas quem fala é o estado vazio, não o rodapé. */}
          {totalItems > 0 &&
            `${totalItems} pedidos · página ${currentPage} de ${totalPages} · nesta página: ${formatMoney(pageAmount)} (comissão ${formatMoney(pageCommission)})`}
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
