"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { Receipt } from "lucide-react";
import { useMemo } from "react";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "../../../utils";
import { AddOrderModal } from "./AddOrderModal";
import { DeleteOrderModal } from "./DeleteOrderModal";
import { EditOrderModal } from "./EditOrderModal";
import { FACTORY_ORDERS_QUERY } from "./gql";

interface Order {
  id: string;
  orderDate: string;
  totalAmount: string;
  commissionAmount: string;
  status: string;
  notes: string | null;
  seller: { id: string; name: string } | null;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
}

interface OrdersQueryData {
  factory_orders: {
    edges: { node: Order }[];
    totalCount: number;
  };
}

interface Props {
  factoryId: string;
}

export function OrdersTab({ factoryId }: Props) {
  const { data, loading } = useQuery<OrdersQueryData>(FACTORY_ORDERS_QUERY, {
    variables: {
      input: {
        first: 50,
        filters: [{ field: "factory_id", operator: "eq", value: factoryId }],
      },
    },
  });

  const initialOrders = useMemo<Order[]>(
    () => data?.factory_orders?.edges.map((e) => e.node) ?? [],
    [data]
  );
  const optimistic = useOptimisticList<Order>({ initialData: initialOrders });
  const orders = optimistic.items;

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title className="inline-flex items-center gap-6">
          Pedidos desta fábrica
          <HelpTooltip
            label="Como funcionam os pedidos aqui?"
            content={
              <div className="flex flex-col gap-2">
                <Title variant="label" color="amber">
                  Pedidos da fábrica
                </Title>
                <Title variant="body-sm">
                  Todos os pedidos já registrados para esta fábrica. A comissão
                  é calculada pelas condições comerciais do vínculo (percentual
                  e base de cálculo da aba Visão geral).
                </Title>
                <Title variant="body-sm" color="muted">
                  Clique numa linha para abrir o pedido completo. Os preços do
                  pedido ficam congelados no momento da venda — mudar a tabela
                  de preço depois não altera pedidos já feitos.
                </Title>
              </div>
            }
          />
        </Table.CardHead.Title>
        <Table.CardHead.Actions>
          <AddOrderModal factoryId={factoryId} />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Pedido</Table.Head>
            <Table.Head>Cliente</Table.Head>
            <Table.Head>Vendedor</Table.Head>
            <Table.Head>Data</Table.Head>
            <Table.Head>Valor</Table.Head>
            <Table.Head>Comissão</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && orders.length === 0 ? (
            <Table.Skeleton columns={8} rows={5} />
          ) : orders.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={8}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Receipt size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum pedido encontrado</EmptyState.Title>
                  <EmptyState.Description>
                    Use &quot;Novo pedido&quot; para registrar o primeiro pedido
                    desta fábrica.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            orders.map((o) => {
              const clientName =
                o.client?.nomeFantasia ?? o.client?.razaoSocial ?? "—";
              const sellerInitials = (o.seller?.name ?? "?")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase();

              return (
                <Table.Row key={o.id} href={`/orders/${o.id}`}>
                  <Table.Cell>
                    <Badge.Root color="subtle" appearance="tinted">
                      <Badge.Text>#{o.id.slice(-6).toUpperCase()}</Badge.Text>
                    </Badge.Root>
                  </Table.Cell>
                  <Table.Cell variant="strong">{clientName}</Table.Cell>
                  <Table.Cell flex>
                    <Avatar
                      size="sm"
                      color="neutral"
                      initials={sellerInitials}
                    />
                    <Table.CellText variant="dim">
                      {o.seller?.name ?? "—"}
                    </Table.CellText>
                  </Table.Cell>
                  <Table.Cell variant="dim">
                    {formatDateDMY(o.orderDate)}
                  </Table.Cell>
                  <Table.Cell variant="strong">
                    {formatMoney(o.totalAmount)}
                  </Table.Cell>
                  <Table.Cell variant="dim">
                    {formatMoney(o.commissionAmount)}
                  </Table.Cell>
                  <Table.Cell>
                    <Badge.Root
                      color={ORDER_STATUS_COLOR[o.status] ?? "neutral"}
                      appearance="tinted"
                    >
                      <Badge.Text>
                        {ORDER_STATUS_LABEL[o.status] ?? o.status}
                      </Badge.Text>
                    </Badge.Root>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-4">
                      <EditOrderModal orderId={o.id} initialNotes={o.notes} />
                      <DeleteOrderModal
                        orderId={o.id}
                        orderCode={`#${o.id.slice(-6).toUpperCase()}`}
                        onRemoveOptimistic={optimistic.removeOptimistic}
                        onCommit={optimistic.commit}
                        onRollback={optimistic.rollback}
                      />
                    </div>
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
