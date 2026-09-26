"use client";

import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { ReceiptText } from "lucide-react";

import { StalledOrder } from "../../interface";
import { daysBetween } from "../../utils";

interface Props {
  orders: StalledOrder[];
  todayIso: string;
}

/**
 * Confirmados e ainda não faturados. Sem ação em lote de propósito: faturar
 * pede a nota, a data e o prazo de CADA pedido (é daí que saem os boletos e a
 * comissão) — a linha leva ao pedido, onde o faturamento é lançado.
 */
export function AwaitingInvoiceTable({ orders, todayIso }: Props) {
  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Confirmados sem faturar
          <HelpTooltip
            label="Sobre os confirmados sem faturar"
            content="Pedidos fechados com o cliente que a fábrica ainda não faturou. Abra o pedido para lançar o faturamento com a nota, ou cancele se ele não vai sair."
          />
        </Table.CardHead.Title>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Pedido em</Table.Head>
            <Table.Head>Valor</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {orders.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={5}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <ReceiptText size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>
                    Nada esperando faturamento
                  </EmptyState.Title>
                  <EmptyState.Description>
                    Todo pedido confirmado já foi faturado pela fábrica.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            orders.map((order) => (
              <Table.Row key={order.id} href={`/orders/${order.id}`}>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {clientName(order.client)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {factoryName(order.factory)}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {order.seller?.name ?? "—"}
                </Table.Cell>
                <Table.Cell variant="dim" className="whitespace-nowrap">
                  {formatDateDMY(order.orderDate)}
                  <Table.CellText variant="dim" className="ml-4">
                    há {daysBetween(order.orderDate, todayIso)} dias
                  </Table.CellText>
                </Table.Cell>
                <Table.Cell variant="strong" className="whitespace-nowrap">
                  {formatMoney(order.totalAmount)}
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
