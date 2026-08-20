"use client";

import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Filters } from "@/components/Filters";
import { QueryError } from "@/components/QueryError";
import { HelpTooltip } from "@/components/HelpTooltip";
import { Table } from "@/components/Table";
import { Title } from "@/components/Title";
import { Loading } from "@/components/Loading";
import { Pagination } from "@/components/Pagination";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import {
  orderStatusLabel,
  orderStatusTone,
} from "@/app/(inside)/_shared/orderStatus";
import { formatDateDMY, formatMoney } from "@/utils/format/masks";
import { Receipt } from "lucide-react";
import { FACTORY_ORDER_COLUMN_HELP } from "../../../help";
import { EditOrderModal } from "../../../../_components/EditOrderModal";
import { UPDATE_ORDER_FROM_FACTORY_MUTATION } from "../../../../_components/EditOrderModal";
import { AddOrderModal } from "./AddOrderModal";
import { DeleteOrderModal } from "./DeleteOrderModal";
import { ImportOrderModal } from "./ImportOrderModal";
import { FeatureGate } from "@/components/FeatureGate";
import { FactoryOrder } from "./gql";
import { useFactoryOrdersTable } from "./useFactoryOrdersTable";

interface Props {
  factoryId: string;
}

export function OrdersTab({ factoryId }: Props) {
  // Página, ordem e filtros resolvidos no BANCO — ver `useFactoryOrdersTable`.
  const table = useFactoryOrdersTable(factoryId);

  const optimistic = useOptimisticList<FactoryOrder>({
    initialData: table.displayedData,
  });
  const orders = optimistic.items;
  const { loading, error, refetch } = table;
  const isNarrowed = Object.values(table.inputValues).some(Boolean);

  return (
    <Table.Root sort={table.sort} data-tour="factory-orders-table">
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
        <Table.CardHead.Actions data-tour="factory-orders-actions">
          <Filters
            fields={table.filterFields}
            values={table.inputValues}
            onChange={table.setFilters}
          />
          {/* Importação em massa é recurso de plano. */}
          <FeatureGate feature="BULK_IMPORT">
            <ImportOrderModal
              factoryId={factoryId}
              onChanged={() => refetch()}
            />
          </FeatureGate>
          <AddOrderModal factoryId={factoryId} />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            {/* Os `sortKey` são nomes de COLUNA no backend, não campos do
                JSON: quem ordena é o banco, sobre a fábrica inteira. Cliente e
                vendedor ordenam pelo nome exibido, resolvido na tabela vizinha. */}
            <Table.Head title={FACTORY_ORDER_COLUMN_HELP.code}>
              Pedido
            </Table.Head>
            <Table.Head
              sortKey="client_name"
              title={FACTORY_ORDER_COLUMN_HELP.client}
            >
              Cliente
            </Table.Head>
            <Table.Head
              sortKey="seller_name"
              title={FACTORY_ORDER_COLUMN_HELP.seller}
            >
              Vendedor
            </Table.Head>
            <Table.Head
              sortKey="order_date"
              sortFirst="desc"
              title={FACTORY_ORDER_COLUMN_HELP.date}
            >
              Data
            </Table.Head>
            <Table.Head
              sortKey="total_amount"
              sortFirst="desc"
              align="right"
              title={FACTORY_ORDER_COLUMN_HELP.amount}
            >
              Valor
            </Table.Head>
            <Table.Head
              sortKey="commission_amount"
              sortFirst="desc"
              align="right"
              title={FACTORY_ORDER_COLUMN_HELP.commission}
            >
              Comissão
            </Table.Head>
            <Table.Head
              sortKey="status"
              title={FACTORY_ORDER_COLUMN_HELP.status}
            >
              Status
            </Table.Head>
            <Table.Head
              className="text-right"
              title={FACTORY_ORDER_COLUMN_HELP.actions}
            >
              Ações
            </Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {loading && orders.length === 0 ? (
            <Table.Skeleton columns={8} rows={5} />
          ) : error && orders.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={8}>
                <QueryError flat onRetry={() => refetch()} />
              </Table.Cell>
            </Table.Row>
          ) : orders.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={8}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Receipt size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum pedido encontrado</EmptyState.Title>
                  <EmptyState.Description>
                    {isNarrowed
                      ? "Ajuste os filtros para encontrar o pedido."
                      : 'Use "Novo pedido" para registrar o primeiro pedido desta fábrica.'}
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
                  <Table.Cell variant="strong" align="right">
                    {formatMoney(o.totalAmount)}
                  </Table.Cell>
                  <Table.Cell variant="dim" align="right">
                    {formatMoney(o.commissionAmount)}
                  </Table.Cell>
                  <Table.Cell>
                    {/* Vocabulário compartilhado: o mapa local desta pasta não
                        conhece INVOICED, e pedido faturado aparecia com a
                        palavra crua, em inglês, na cor de "sem situação". */}
                    <Badge.Root
                      color={orderStatusTone(o.status)}
                      appearance="tinted"
                    >
                      <Badge.Text>{orderStatusLabel(o.status)}</Badge.Text>
                    </Badge.Root>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex items-center justify-end gap-4">
                      <EditOrderModal
                        orderId={o.id}
                        initialNotes={o.notes}
                        mutation={UPDATE_ORDER_FROM_FACTORY_MUTATION}
                        invalidateKeys={["orders"]}
                        stopPropagationOnTrigger
                      />
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

      {/* Faltava: a aba mostrava 50 pedidos e nada dizia que havia mais. */}
      <Table.Footer>
        <Table.Footer.Info>
          {loading && orders.length > 0 && (
            <Loading.Spinner size="sm" className="mr-6 inline-block" />
          )}
          {table.totalItems > 0
            ? `${table.totalItems} pedido(s) · página ${table.currentPage} de ${table.totalPages}`
            : "Nenhum pedido encontrado"}
        </Table.Footer.Info>

        <Pagination.Smart
          currentPage={table.currentPage}
          totalPages={table.totalPages}
          onPageChange={table.setCurrentPage}
        />
      </Table.Footer>
    </Table.Root>
  );
}
