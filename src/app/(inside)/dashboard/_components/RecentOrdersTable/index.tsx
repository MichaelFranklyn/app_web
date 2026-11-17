"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Table } from "@/components/Table";
import { ArrowRight, Receipt } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";
import { formatMoney } from "@/utils/format/masks";
import { DashboardOrder } from "../../interface";
import {
  ORDER_STATUS_COLOR,
  ORDER_STATUS_LABEL,
  namedEntityLabel,
} from "../../utils";

/**
 * Piso das colunas de nome nesta tabela. O padrão da `Table` (220px) foi
 * pensado para tabela de página inteira; aqui ela divide a linha com
 * "Próximas visitas", e dois pisos de 220px mais Valor e Status passavam da
 * largura do card em notebook — a etiqueta de status saía da caixa e a tabela
 * rolava (1293px, relato de 17/11/2026). Com 140px o nome quebra em mais
 * linhas, e nada rola para o lado.
 */
const NAME_CELL_STYLE = "desktop:min-w-[140px]";

interface Props {
  orders: DashboardOrder[];
}

export function RecentOrdersTable({ orders }: Props) {
  const { navigateTo, isPending } = useNavigation();

  return (
    <Table.Root>
      <Table.CardHead className="min-h-13.75">
        <Table.CardHead.Title size="sm" weight="bold">
          Pedidos recentes
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Button.Root
            type="button"
            color="amber"
            appearance="solid"
            size="sm"
            disabled={isPending}
            onClick={() => navigateTo("/orders")}
          >
            <Button.Title>Ver todos</Button.Title>
            <Button.Icon icon={ArrowRight} />
          </Button.Root>
        </Table.CardHead.Actions>
      </Table.CardHead>
      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Fábrica</Table.Head>
            <Table.Head>Valor</Table.Head>
            <Table.Head>Status</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {orders.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={4}>
                <EmptyState.Root flat>
                  <EmptyState.Icon>
                    <Receipt size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum pedido no período</EmptyState.Title>
                  <EmptyState.Description>
                    Os pedidos cadastrados aparecerão aqui.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            orders.map((order) => (
              <Table.Row key={order.id}>
                <Table.Cell variant="strong" className={NAME_CELL_STYLE}>
                  {namedEntityLabel(order.client)}
                </Table.Cell>
                <Table.Cell variant="dim" className={NAME_CELL_STYLE}>
                  {namedEntityLabel(order.factory)}
                </Table.Cell>
                <Table.Cell variant="strong">
                  {formatMoney(order.totalAmount)}
                </Table.Cell>
                <Table.Cell>
                  <Badge.Root
                    color={ORDER_STATUS_COLOR[order.status]}
                    appearance="tinted"
                  >
                    <Badge.Text>{ORDER_STATUS_LABEL[order.status]}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
