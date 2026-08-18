"use client";

import { Badge } from "@/components/Badges";
import { EmptyState } from "@/components/EmptyState";
import { Filters, FilterField } from "@/components/Filters";
import { Table } from "@/components/Table";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useLocalTable, LocalField } from "@/hooks/useLocalTable";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";
import { Package, SearchX, Zap } from "lucide-react";
import { useMemo } from "react";
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
import { FeatureGate } from "@/components/FeatureGate";
import { ORDER_ITEMS_QUERY } from "./gql";

/**
 * Colunas ordenáveis. Todo valor de dinheiro/quantidade chega como STRING do
 * backend (Numeric), então o `Number` não é enfeite: sem ele "1000" viria antes
 * de "300", que é a comparação de texto dígito a dígito.
 */
const ITEM_COLUMNS = {
  product: (item: OrderItem) => item.product?.name,
  tier: (item: OrderItem) => item.tier?.name,
  // O que a célula mostra é `quantity`; ordenar por `unitsTotal` faria a
  // coluna reordenar por um número que não está na tela.
  units: (item: OrderItem) => Number(item.quantity),
  unitPrice: (item: OrderItem) => Number(item.unitPrice),
  unitPriceWithTax: (item: OrderItem) => Number(item.unitPriceWithTax),
  discount: (item: OrderItem) => Number(item.discount),
  ipiRate: (item: OrderItem) => Number(item.ipiRate),
  taxAmount: (item: OrderItem) => Number(item.taxAmount),
  subtotal: (item: OrderItem) => Number(item.subtotal),
};

const ITEM_FIELDS: Record<string, LocalField<OrderItem>> = {
  // Casa por trecho do código (SKU) OU do nome, sem acento.
  search: {
    type: "text",
    match: (item, value) => matchesProductSearch(item.product, value),
  },
  tierId: { type: "select", match: (item, value) => item.tier?.id === value },
};

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

  // Ordem de criação, do mais antigo para o mais novo. A importação grava um
  // item por vez (commit por linha), então o created_at cresce na ordem da
  // planilha — a tabela mostra os itens na MESMA ordem do arquivo enviado.
  // Itens adicionados à mão depois entram no fim da lista. Esta continua sendo
  // a ordem BASE: ordenar por uma coluna a substitui, e o 3º clique a devolve.
  const displayedItems = useMemo(
    () => [...items].sort(byCreatedAtAsc),
    [items]
  );

  const table = useLocalTable<OrderItem>({
    items: displayedItems,
    columns: ITEM_COLUMNS,
    fields: ITEM_FIELDS,
  });
  const filteredItems = table.displayedData;

  const tierOptions = useMemo(
    () =>
      [
        ...new Map(
          items
            .filter((item) => item.tier)
            .map((item) => [item.tier!.id, item.tier!.name])
        ).entries(),
      ]
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    [items]
  );

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "text",
        key: "search",
        label: "Produto",
        placeholder: "Código ou nome do produto",
      },
      {
        type: "select",
        key: "tierId",
        label: "Tabela",
        placeholder: "Todas as tabelas",
        options: tierOptions,
        // Um pedido de tabela única não tem o que escolher aqui.
        hidden: tierOptions.length < 2,
      },
    ],
    [tierOptions]
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
    <Table.Root sort={table.sort}>
      <Table.CardHead>
        <Table.CardHead.Title>Itens do pedido</Table.CardHead.Title>
        <Table.CardHead.Actions>
          {showSearch && (
            <Filters
              fields={filterFields}
              values={table.inputValues}
              onChange={table.setFilters}
              onTextChange={table.setFilter}
            />
          )}
          <Badge.Root color="neutral" appearance="tinted">
            <Badge.Text>
              {items.length} {items.length === 1 ? "item" : "itens"}
            </Badge.Text>
          </Badge.Root>
          {/* Importação em massa é recurso de plano. */}
          <FeatureGate feature="BULK_IMPORT">
            <ImportOrderModal
              orderId={orderId}
              ipiInOrder={ipiInOrder}
              onImported={handleRefetch}
            />
          </FeatureGate>
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
            <Table.Head sortKey="product">Produto</Table.Head>
            <Table.Head sortKey="tier">Tabela</Table.Head>
            <Table.Head sortKey="units" sortFirst="desc" align="right">
              Qtd (unidades)
            </Table.Head>
            <Table.Head sortKey="unitPrice" sortFirst="desc" align="right">
              Preço sem imposto
            </Table.Head>
            <Table.Head
              sortKey="unitPriceWithTax"
              sortFirst="desc"
              align="right"
            >
              Preço com imposto
            </Table.Head>
            <Table.Head sortKey="discount" sortFirst="desc" align="right">
              Desconto
            </Table.Head>
            {ipiInOrder && (
              <Table.Head sortKey="ipiRate" sortFirst="desc" align="right">
                Alíq. IPI
              </Table.Head>
            )}
            <Table.Head sortKey="taxAmount" sortFirst="desc" align="right">
              Imposto
            </Table.Head>
            <Table.Head sortKey="subtotal" sortFirst="desc" align="right">
              Subtotal{ipiInOrder ? " (sem IPI)" : ""}
            </Table.Head>
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
                    Nenhum item deste pedido casa com os filtros aplicados.
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
                <Table.Cell variant="strong" align="right">
                  {formatNumber(Number(item.quantity))}
                </Table.Cell>
                <Table.Cell variant="dim" align="right">
                  {formatMoney(item.unitPrice)}
                </Table.Cell>
                <Table.Cell variant="strong" align="right">
                  {formatMoney(item.unitPriceWithTax)}
                </Table.Cell>
                <Table.Cell variant="dim" align="right">
                  {parseFloat(item.discount) > 0
                    ? formatMoney(item.discount)
                    : "—"}
                </Table.Cell>
                {ipiInOrder && (
                  <Table.Cell variant="dim" align="right">
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
                <Table.Cell variant="dim" align="right">
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
                <Table.Cell variant="strong" align="right">
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
