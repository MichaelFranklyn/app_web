"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { Table } from "@/components/Table";
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
  currentPage,
  setCurrentPage,
  totalPages,
  totalItems,
}: Props) {
  const pageAmount = sumBy(items, (order) => order.totalAmount);
  const pageCommission = sumBy(items, (order) => order.commissionAmount);

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Pedidos faturados</Table.CardHead.Title>
        <Table.CardHead.Description>
          Recortados pela data em que a fábrica faturou.
        </Table.CardHead.Description>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Faturamento</Table.Head>
            <Table.Head>Data do pedido</Table.Head>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Vendedor</Table.Head>
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
                  <EmptyState.Title>
                    Nenhum faturamento no período
                  </EmptyState.Title>
                  <EmptyState.Description>
                    Só entram aqui os pedidos que a fábrica já faturou. Amplie o
                    período ou confira a aba &quot;Pedidos enviados&quot;.
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
                <Table.Cell
                  variant="strong"
                  className="max-w-[220px] truncate"
                  title={clientName(order.client)}
                >
                  {clientName(order.client)}
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
