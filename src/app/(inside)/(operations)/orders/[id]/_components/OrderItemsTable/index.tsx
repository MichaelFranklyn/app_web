"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { InputSearch } from "@/components/Input";
import { Table } from "@/components/Table";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { Package, SearchX, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { OrderItem, OrderItemsResponse } from "../../interface";
import {
  byCreatedAtAsc,
  matchesProductSearch,
  taxRatesLabel,
} from "../../utils";
import { AddOrderItemModal } from "./AddOrderItemModal";
import { DeleteOrderItemModal } from "./DeleteOrderItemModal";
import { EditOrderItemModal } from "./EditOrderItemModal";
import { ImportOrderModal } from "./ImportOrderModal";
import { ORDER_ITEMS_QUERY } from "./gql";

// A partir de quantos itens a busca aparece — abaixo disso a lista cabe na tela
// (mesma ordem de grandeza do maxHeight da tabela) e o campo só polui o cabeçalho.
const SEARCH_THRESHOLD = 8;

interface Props {
  orderId: string;
  factoryId: string | null;
  /** Cliente do pedido: define o nível acordado que sugere o preço do item. */
  clientId?: string | null;
  /** Fábrica cobra IPI no pedido: exibe a alíquota por item e o IPI nos totais. */
  ipiInOrder?: boolean;
  /** Atualiza o detalhe do pedido (totais) após mudanças nos itens. */
  onOrderChanged?: () => void;
}

export function OrderItemsTable({
  orderId,
  factoryId,
  clientId,
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

  // Produto, Tabela, Qtd, Preço sem imposto, Preço com imposto, Desconto,
  // Imposto, Subtotal, Ações — mais Alíq. IPI nas fábricas com IPI no pedido.
  const columns = ipiInOrder ? 10 : 9;

  const [search, setSearch] = useState("");

  // Ordem de criação, do mais antigo para o mais novo. A importação grava um
  // item por vez (commit por linha), então o created_at cresce na ordem da
  // planilha — a tabela mostra os itens na MESMA ordem do arquivo enviado.
  // Itens adicionados à mão depois entram no fim da lista.
  const displayedItems = useMemo(
    () => [...items].sort(byCreatedAtAsc),
    [items]
  );

  // Filtro por código (SKU) OU nome do produto — casa por trecho, sem acento.
  const filteredItems = useMemo(
    () =>
      displayedItems.filter((item) =>
        matchesProductSearch(item.product, search)
      ),
    [displayedItems, search]
  );

  const showSearch = items.length > SEARCH_THRESHOLD;

  // O mesmo produto não entra duas vezes no pedido.
  const existingProductIds = useMemo(
    () =>
      items.map((item) => item.product?.id).filter((id): id is string => !!id),
    [items]
  );

  // Nível do último item adicionado (o mais novo = o último da lista ordenada):
  // o próximo item abre nele, como o wizard mantém o nível entre itens. Itens
  // com preço manual não têm nível, então procuramos do fim para o início.
  const lastTierId = useMemo(() => {
    for (let i = displayedItems.length - 1; i >= 0; i--) {
      const tierId = displayedItems[i].tier?.id;
      if (tierId) return tierId;
    }
    return null;
  }, [displayedItems]);

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
          {showSearch && (
            <InputSearch
              size="sm"
              placeholder="Buscar por código ou nome..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          )}
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
            clientId={clientId}
            ipiInOrder={ipiInOrder}
            existingProductIds={existingProductIds}
            lastTierId={lastTierId}
            onAdded={addOptimistic}
            onRefetch={handleRefetch}
          />
        </Table.CardHead.Actions>
      </Table.CardHead>

      <Table.Table maxHeight={520}>
        <Table.Header>
          <Table.Row>
            <Table.Head>Produto</Table.Head>
            <Table.Head>Tabela</Table.Head>
            <Table.Head>Qtd (unidades)</Table.Head>
            <Table.Head>Preço sem imposto</Table.Head>
            <Table.Head>Preço com imposto</Table.Head>
            <Table.Head>Desconto</Table.Head>
            {ipiInOrder && <Table.Head>Alíq. IPI</Table.Head>}
            <Table.Head>Imposto</Table.Head>
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
          ) : filteredItems.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={columns}>
                <EmptyState.Root>
                  <EmptyState.Icon>
                    <SearchX size={32} />
                  </EmptyState.Icon>
                  <EmptyState.Title>Nenhum item encontrado</EmptyState.Title>
                  <EmptyState.Description>
                    Nenhum item deste pedido tem o código ou nome &quot;{search}
                    &quot;.
                  </EmptyState.Description>
                </EmptyState.Root>
              </Table.Cell>
            </Table.Row>
          ) : (
            filteredItems.map((item) => (
              <Table.Row key={item.id} className="group">
                <Table.Cell>
                  <div className="flex flex-col items-start gap-2">
                    <Table.CellText variant="strong">
                      {item.product?.name ?? "—"}
                    </Table.CellText>
                    {item.product?.sku && (
                      <Table.CellText variant="dim2">
                        Código {item.product.sku}
                      </Table.CellText>
                    )}
                    {item.isPromo && (
                      <Badge.Root color="orange" appearance="tinted" size="xs">
                        <Badge.Icon>
                          <Zap />
                        </Badge.Icon>
                        <Badge.Text>Promoção</Badge.Text>
                      </Badge.Root>
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
                <Table.Cell variant="strong">
                  {formatMoney(item.unitPriceWithTax)}
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
                <Table.Cell variant="dim">
                  {parseFloat(item.taxAmount) > 0 ? (
                    <div className="flex flex-col">
                      <Table.CellText variant="strong">
                        {taxRatesLabel(item.product?.taxes, formatNumber)}
                      </Table.CellText>
                      <Table.CellText variant="dim2">
                        {formatMoney(item.taxAmount)}
                      </Table.CellText>
                    </div>
                  ) : (
                    "—"
                  )}
                </Table.Cell>
                <Table.Cell variant="strong">
                  {formatMoney(Number(item.subtotal) + Number(item.taxAmount))}
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
