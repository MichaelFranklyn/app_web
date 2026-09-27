"use client";

import { Emphasis } from "@/components/Emphasis";
import { PageContent } from "@/components/PageContent";
import { QueryError } from "@/components/QueryError";
import { SelectionBar } from "@/components/SelectionBar";
import { Tabs } from "@/components/Tabs";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useOptimisticList } from "@/hooks/useOptimisticList";
import { useScopedSelection } from "@/hooks/useScopedSelection";
import { buildQueryFilters, useTableData } from "@/hooks/useTableData";
import { ORDER_DELIVERY_CACHE_FIELDS } from "@/utils/cacheFields";
import { getTodayIso } from "@/utils/format/date";
import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { AwaitingDeliveryTable } from "./_components/AwaitingDeliveryTable";
import { DeliverOrdersModal } from "./_components/DeliverOrdersModal";
import { ImportNfeModal } from "./_components/ImportNfeModal";
import { OrdersHeader } from "./_components/OrdersHeader";
import { OrdersTable } from "./_components/OrdersTable";
import { TabIntro } from "./_components/TabIntro";
import { ORDER_STATS_QUERY, ORDERS_QUERY } from "./gql";
import { ORDER_TAB_HELP } from "./help";
import { ITEMS_PER_PAGE, Order, OrdersStats, QueryData } from "./interface";
import { useOrderFilters } from "./useOrderFilters";
import { useOrdersTab } from "./useOrdersTab";
import { ORDER_DEFAULT_SORT, ORDER_SORTABLE_FIELDS } from "./utils";

const DELIVERY_SCOPE = "awaiting-delivery";

interface Props {
  initialData: QueryData;
  /** Gestor (owner/admin/su) pode filtrar por vendedor; vendedor já vê só o seu. */
  canFilterBySeller: boolean;
  /** Perfil de vendedor de quem abriu a tela; dono implícito do pedido novo. */
  ownSellerId: string | null;
}

export default function OrdersContent({
  initialData,
  canFilterBySeller,
  ownSellerId,
}: Props) {
  const { tab, setTab, baseFilters, tableFields, scopeLabel } = useOrdersTab();
  const isAll = tab === "all";
  const selection = useScopedSelection();
  const invalidateClient = useInvalidateQueriesClient();

  const tableData = useTableData<QueryData, Order>({
    query: ORDERS_QUERY,
    fields: tableFields,
    getConnection: (data) => data.orders_list,
    itemsPerPage: ITEMS_PER_PAGE,
    sortableFields: ORDER_SORTABLE_FIELDS,
    backendDefaultSort:
      tab === "delivery"
        ? { key: "invoiced_at", direction: "asc" }
        : ORDER_DEFAULT_SORT,
    baseFilters,
    // O SSR trouxe a lista SEM filtro: semear o cache numa aba filtrada
    // mostraria os pedidos errados (as variáveis não batem com o que ela consulta).
    initialData: isAll ? initialData : undefined,
  });

  const filterFields = useOrderFilters({
    canFilterBySeller,
    hideStatus: !isAll,
  });

  // Os KPIs consultam o MESMO recorte da tabela (mesmos filtros, mesma aba):
  // sem isso, filtrar por um vendedor deixaria o topo somando a empresa
  // inteira — dois números diferentes para a mesma pergunta na mesma tela.
  const queryFilters = useMemo(
    () => buildQueryFilters(tableFields, tableData.inputValues),
    [tableFields, tableData.inputValues]
  );
  const statsFilters = useMemo(
    () => [
      ...(baseFilters ?? []).map((filter) => ({ ...filter, operator: "eq" })),
      ...queryFilters,
    ],
    [baseFilters, queryFilters]
  );

  const { data: statsData, refetch: refetchStats } = useQuery<OrdersStats>(
    ORDER_STATS_QUERY,
    { variables: { input: { first: ITEMS_PER_PAGE, filters: statsFilters } } }
  );

  const optimistic = useOptimisticList<Order>({
    initialData: tableData.displayedData,
  });

  // Faturar ou entregar muda o pedido em todas as telas que o mostram.
  const handleChanged = () => {
    void tableData.refetch();
    void refetchStats();
    void invalidateClient(ORDER_DELIVERY_CACHE_FIELDS);
  };

  const listProps = {
    items: optimistic.items,
    loading: tableData.loading,
    currentPage: tableData.currentPage,
    setCurrentPage: tableData.setCurrentPage,
    totalPages: tableData.totalPages,
    totalItems: tableData.totalItems,
    inputValues: tableData.inputValues,
    setFilters: tableData.setFilters,
    setFilter: tableData.setFilter,
    sort: tableData.sort,
    filterFields,
  };

  // Falha na busca não pode sair como "Nenhum pedido encontrado": a lista vazia
  // é uma afirmação sobre a empresa, e o EmptyState a faria sem ter o dado.
  const failed = tableData.error && optimistic.items.length === 0;
  const retry = <QueryError onRetry={() => tableData.refetch()} />;
  const selected = selection.selectedIn(DELIVERY_SCOPE) ?? new Set<string>();

  return (
    <PageContent>
      <OrdersHeader
        stats={statsData}
        isFiltered={queryFilters.length > 0}
        onAddOptimistic={optimistic.addOptimistic}
        canSelectSeller={canFilterBySeller}
        ownSellerId={ownSellerId}
        // Os mesmos filtros dos KPIs: o arquivo sai com o recorte da tela.
        exportFilters={statsFilters}
        filterFields={filterFields}
        inputValues={tableData.inputValues}
        // A ordenação da tabela vale para o arquivo também.
        order={tableData.order}
        scopeLabel={scopeLabel}
        hasOrders={tableData.totalItems > 0}
      />

      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List data-tour="orders-tabs">
          {/* A explicação vai no `title` do próprio gatilho: a aba já é um
              botão, e um "?" ao lado dela viraria botão dentro de botão. */}
          <Tabs.Item value="all" title={ORDER_TAB_HELP.all}>
            Todos os pedidos
          </Tabs.Item>
          <Tabs.Item value="pending" title={ORDER_TAB_HELP.pending}>
            Esperando faturamento
          </Tabs.Item>
          <Tabs.Item value="delivery" title={ORDER_TAB_HELP.delivery}>
            Esperando entrega
          </Tabs.Item>
        </Tabs.List>

        <Tabs.Content value="all">
          {failed ? (
            retry
          ) : (
            <OrdersTable {...listProps} title="Lista de pedidos" />
          )}
        </Tabs.Content>

        <Tabs.Content value="pending" className="flex flex-col gap-12">
          <TabIntro action={<ImportNfeModal onInvoiced={handleChanged} />}>
            Pedidos fechados com o cliente que a fábrica ainda não faturou.
            Recebeu as notas fiscais? Envie os arquivos XML e o sistema fatura
            os pedidos sozinho. Ou abra o pedido para lançar a nota à mão.
          </TabIntro>
          {failed ? (
            retry
          ) : (
            <OrdersTable
              {...listProps}
              title="Pedidos esperando faturamento"
              emptyTitle="Nenhum pedido esperando faturamento"
              emptyDescription="Todo pedido confirmado já foi faturado. Os que ainda não foram aparecem aqui."
            />
          )}
        </Tabs.Content>

        <Tabs.Content value="delivery" className="flex flex-col gap-12">
          <TabIntro>
            A fábrica já faturou e o prazo de entrega passou. Marque os pedidos
            que já chegaram ao cliente e toque em{" "}
            <Emphasis>Confirmar entrega</Emphasis>, na barra que aparece
            embaixo. Na dúvida, pergunte ao cliente antes.
          </TabIntro>
          {failed ? (
            retry
          ) : (
            <AwaitingDeliveryTable
              {...listProps}
              todayIso={getTodayIso()}
              selectedIds={selected}
              onToggle={(id) => selection.toggle(DELIVERY_SCOPE, id)}
              onTogglePage={() =>
                selection.toggleAll(
                  DELIVERY_SCOPE,
                  optimistic.items.map((order) => order.id)
                )
              }
            />
          )}
        </Tabs.Content>
      </Tabs.Root>

      <SelectionBar
        count={tab === "delivery" ? selection.count : 0}
        noun={{
          singular: "pedido selecionado",
          plural: "pedidos selecionados",
        }}
        scopeLabel="Esperando entrega"
        onClear={selection.clear}
      >
        <DeliverOrdersModal
          orderIds={selection.ids}
          onDone={() => {
            selection.clear();
            handleChanged();
          }}
        />
      </SelectionBar>
    </PageContent>
  );
}
