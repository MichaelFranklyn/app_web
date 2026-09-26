"use client";

import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Input } from "@/components/Input";
import { Table } from "@/components/Table";
import { clientName, factoryName } from "@/utils/company";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { PackageCheck } from "lucide-react";

import { StalledOrder } from "../../interface";
import { assumedDeliveryDate, daysBetween } from "../../utils";

interface Props {
  orders: StalledOrder[];
  defaultDeliveryDays: number;
  todayIso: string;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}

/**
 * Faturados com a entrega prevista vencida. A coluna "Entregue em" mostra a
 * data que será gravada se ninguém informar outra — é ela que abastece o
 * estoque do cliente, então a pessoa precisa vê-la antes de confirmar.
 */
export function AwaitingDeliveryTable({
  orders,
  defaultDeliveryDays,
  todayIso,
  selectedIds,
  onToggle,
  onToggleAll,
}: Props) {
  const allSelected =
    orders.length > 0 && orders.every((o) => selectedIds.has(o.id));

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Faturados sem entrega confirmada
          <HelpTooltip
            label="Sobre os faturados sem entrega"
            content={`A fábrica já faturou e o prazo de entrega passou (o do pedido ou ${defaultDeliveryDays} dias quando ele não tem prazo). Enquanto a entrega não é confirmada, o cliente fica fora da rotina nesta fábrica e o estoque dele não é atualizado.`}
          />
        </Table.CardHead.Title>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head className="w-40">
              <Input.Checkbox
                label=""
                aria-label="Selecionar todos os pedidos faturados"
                checked={allSelected}
                onChange={onToggleAll}
              />
            </Table.Head>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Faturado em</Table.Head>
            <Table.Head>Entregue em</Table.Head>
            <Table.Head>Valor</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {orders.length === 0 ? (
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
            orders.map((order) => {
              const invoicedAt = order.invoicedAt ?? order.orderDate;
              const deliveredAt = assumedDeliveryDate(
                invoicedAt,
                order.deliveryEstimateDays,
                defaultDeliveryDays,
                todayIso
              );
              return (
                <Table.Row key={order.id} href={`/orders/${order.id}`}>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Input.Checkbox
                      label=""
                      aria-label={`Selecionar o pedido de ${clientName(order.client)}`}
                      checked={selectedIds.has(order.id)}
                      onChange={() => onToggle(order.id)}
                    />
                  </Table.Cell>
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
                    {formatDateDMY(invoicedAt)}
                    <Table.CellText variant="dim" className="ml-4">
                      há {daysBetween(invoicedAt, todayIso)} dias
                    </Table.CellText>
                  </Table.Cell>
                  <Table.Cell variant="dim" className="whitespace-nowrap">
                    {formatDateDMY(deliveredAt)}
                  </Table.Cell>
                  <Table.Cell variant="strong" className="whitespace-nowrap">
                    {formatMoney(order.totalAmount)}
                  </Table.Cell>
                </Table.Row>
              );
            })
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
