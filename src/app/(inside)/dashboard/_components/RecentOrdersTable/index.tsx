"use client";

import { Badge } from "@/components/Badges";
import { Button } from "@/components/Button";
import { EmptyState } from "@/components/EmptyState";
import { Table } from "@/components/Table";
import { ArrowRight, Plus, Receipt } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";
import { formatMoney } from "@/utils/format/masks";
import { newOrderUrl } from "@/utils/newOrderUrl";
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
  /** O vazio traz "Novo pedido" só quando a empresa não tem rotina: com rotina,
   * a ação do painel vazio é "Montar semana" (um botão de ação, não dois). */
  showNewOrderAction: boolean;
}

export function RecentOrdersTable({ orders, showNewOrderAction }: Props) {
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
      {/* Vazio fora da tabela: o cabeçalho Cliente/Fábrica/Valor/Status
          sobre nenhuma linha só ocupava espaço (crítica de 20/11/2026). */}
      {orders.length === 0 ? (
        <EmptyState.Root flat>
          <EmptyState.Icon>
            <Receipt size={32} />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhum pedido no período</EmptyState.Title>
          <EmptyState.Description>
            Os pedidos cadastrados aparecerão aqui.
          </EmptyState.Description>
          {showNewOrderAction && (
            <EmptyState.Actions>
              <Button.Link
                href={newOrderUrl()}
                appearance="solid"
                color="amber"
                size="sm"
              >
                <Button.Icon icon={Plus} />
                <Button.Title>Novo pedido</Button.Title>
              </Button.Link>
            </EmptyState.Actions>
          )}
        </EmptyState.Root>
      ) : (
        // Abaixo do desktop cada pedido vira um cartão (cliente, fábrica,
        // situação e valor), como em /orders: as 4 colunas em 360px
        // espremiam o nome do cliente em várias linhas.
        <Table.Table cards>
          <Table.Header>
            <Table.Row>
              <Table.Head>Cliente</Table.Head>
              <Table.Head>Fábrica</Table.Head>
              <Table.Head>Valor</Table.Head>
              <Table.Head>Status</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {orders.map((order) => (
              <Table.Row key={order.id}>
                <Table.Cell
                  variant="strong"
                  className={NAME_CELL_STYLE}
                  card="title"
                >
                  {namedEntityLabel(order.client)}
                </Table.Cell>
                <Table.Cell
                  variant="dim"
                  className={NAME_CELL_STYLE}
                  label="Fábrica"
                >
                  {namedEntityLabel(order.factory)}
                </Table.Cell>
                <Table.Cell variant="strong" card="amount" label="Valor">
                  {formatMoney(order.totalAmount)}
                </Table.Cell>
                <Table.Cell label="Status">
                  <Badge.Root
                    color={ORDER_STATUS_COLOR[order.status]}
                    appearance="tinted"
                  >
                    <Badge.Text>{ORDER_STATUS_LABEL[order.status]}</Badge.Text>
                  </Badge.Root>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Table>
      )}
    </Table.Root>
  );
}
