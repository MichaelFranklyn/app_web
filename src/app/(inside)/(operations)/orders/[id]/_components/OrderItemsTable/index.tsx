"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Table } from "@/components/Table";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { Package } from "lucide-react";
import { useMemo } from "react";
import { OrderItem, OrderItemsResponse } from "../../interface";
import { AddOrderItemModal } from "./AddOrderItemModal";
import { DeleteOrderItemModal } from "./DeleteOrderItemModal";
import { EditOrderItemModal } from "./EditOrderItemModal";
import { ImportOrderModal } from "./ImportOrderModal";
import { ORDER_ITEMS_QUERY } from "./gql";

interface Props {
  orderId: string;
  factoryId: string | null;
  /** Fábrica cobra IPI no pedido: exibe a alíquota por item e o IPI nos totais. */
  ipiInOrder?: boolean;
  /** Atualiza o detalhe do pedido (totais) após mudanças nos itens. */
  onOrderChanged?: () => void;
}

export function OrderItemsTable({
  orderId,
  factoryId,
  ipiInOrder = false,
  onOrderChanged,
}: Props) {
  const invalidateClient = useInvalidateQueriesClient();
  const { data, loading, refetch } = useQuery<OrderItemsResponse>(
    ORDER_ITEMS_QUERY,
    { variables: { orderId } }
  );

  const serverItems = useMemo(
    () => data?.orderItems?.edges?.map((e) => e.node) ?? [],
    [data]
  );

  const { items, addOptimistic, updateOptimistic, removeOptimistic, rollback } =
    useOptimisticList<OrderItem>({ initialData: serverItems });

  const columns = ipiInOrder ? 8 : 7;

  const handleRefetch = () => {
    refetch();
    onOrderChanged?.();
    // Invalida os KPIs (query client-side) para que /orders mostre os novos
    // totais ao voltar para a listagem.
    void invalidateClient(["orderStats"]);
  };

  return (
    <Table.Root>
      <Table.CardHead>
        <Table.CardHead.Title>Itens do pedido</Table.CardHead.Title>
        <Table.CardHead.Actions>
          <Badge.Root color="neutral" appearance="tinted">
            <Badge.Text>
              {items.length} {items.length === 1 ? "item" : "itens"}
            </Badge.Text>
          </Badge.Root>
          <ImportOrderModal
            orderId={orderId}
            ipiInOrder={ipiInOrder}
            onImported={handleRefetch}
          />
          <AddOrderItemModal
            orderId={orderId}
            factoryId={factoryId}
            ipiInOrder={ipiInOrder}
            onAdded={addOptimistic}
            onRefetch={handleRefetch}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Produto</Table.Head>
            <Table.Head>Tabela</Table.Head>
            <Table.Head>Qtd (unidades)</Table.Head>
            <Table.Head>Preço/unidade</Table.Head>
            <Table.Head>Desconto</Table.Head>
            {ipiInOrder && <Table.Head>Alíq. IPI</Table.Head>}
            <Table.Head>Subtotal{ipiInOrder ? " (sem IPI)" : ""}</Table.Head>
            <Table.Head className="text-right">Ações</Table.Head>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {loading && items.length === 0 ? (
            <Table.Skeleton columns={columns} rows={5} />
          ) : items.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <Package size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Pedido sem itens</EmptyState.Title>
                  <EmptyState.Description>
                    Use &quot;Adicionar item&quot; para incluir produtos neste
                    pedido.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            items.map((item) => (
              <Table.Row key={item.id} className="group">
                <Table.Cell>
                  <div className="flex flex-col">
                    <Table.CellText variant="strong">
                      {item.product?.name ?? "—"}
                    </Table.CellText>
                    {item.product?.sku && (
                      <Table.CellText variant="dim2">
                        Código {item.product.sku}
                      </Table.CellText>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell variant="dim">{item.tier?.name ?? "—"}</Table.Cell>
                <Table.Cell variant="strong">
                  {formatNumber(Number(item.quantity))}
                </Table.Cell>
                <Table.Cell variant="dim">
                  {formatMoney(item.unitPrice)}
                </Table.Cell>
                <Table.Cell variant="dim">
                  {parseFloat(item.discount) > 0
                    ? formatMoney(item.discount)
                    : "—"}
                </Table.Cell>
                {ipiInOrder && (
                  <Table.Cell variant="dim">
                    {parseFloat(item.ipiRate) > 0 ? (
                      <div className="flex flex-col">
                        <Table.CellText variant="strong">
                          {formatNumber(Number(item.ipiRate))}%
                        </Table.CellText>
                        <Table.CellText variant="dim2">
                          {formatMoney(item.ipiAmount)}
                        </Table.CellText>
                      </div>
                    ) : (
                      "—"
                    )}
                  </Table.Cell>
                )}
                <Table.Cell variant="strong">
                  {formatMoney(item.subtotal)}
                </Table.Cell>
                <Table.Cell>
                  <div className="flex items-center justify-end gap-4">
                    <EditOrderItemModal
                      item={item}
                      ipiInOrder={ipiInOrder}
                      onOptimisticUpdate={updateOptimistic}
                      onRollback={rollback}
                      onRefetch={handleRefetch}
                    />
                    <DeleteOrderItemModal
                      item={item}
                      onOptimisticRemove={removeOptimistic}
                      onRollback={rollback}
                      onRefetch={handleRefetch}
                    />
                  </div>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Table>
    </Table.Root>
  );
}
