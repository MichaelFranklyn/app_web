"use client";

import { Breadcrumb } from "@/components/Breadcrumb";
import { PageContent } from "@/components/PageContent";
import { PanelHeader } from "@/components/PanelHeader";
import { QueryError } from "@/components/QueryError";
import { SelectionBar } from "@/components/SelectionBar";
import { useInvalidateQueriesClient } from "@/hooks/useInvalidateQueries";
import { useScopedSelection } from "@/hooks/useScopedSelection";
import { ORDER_DELIVERY_CACHE_FIELDS } from "@/utils/cacheFields";
import { getTodayIso } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { useQuery } from "@apollo/client/react";

import { AwaitingDeliveryTable } from "./_components/AwaitingDeliveryTable";
import { AwaitingInvoiceTable } from "./_components/AwaitingInvoiceTable";
import { DeliverOrdersModal } from "./_components/DeliverOrdersModal";
import { STALLED_ORDERS_QUERY } from "./gql";
import { StalledOrdersResponse } from "./interface";
import { StalledOrdersSkeleton } from "./skeleton";
import { sumAmount } from "./utils";

const DELIVERY_SCOPE = "awaiting-delivery";

export default function StalledOrdersContent() {
  const { data, loading, error, refetch } = useQuery<StalledOrdersResponse>(
    STALLED_ORDERS_QUERY,
    { fetchPolicy: "cache-and-network" }
  );
  const selection = useScopedSelection();
  const invalidateClient = useInvalidateQueriesClient();
  const todayIso = getTodayIso();

  const stalled = data?.stalledOrders;
  const awaitingDelivery = stalled?.awaitingDelivery ?? [];
  const awaitingInvoice = stalled?.awaitingInvoice ?? [];
  const selected = selection.selectedIn(DELIVERY_SCOPE) ?? new Set<string>();
  const total = awaitingDelivery.length + awaitingInvoice.length;

  if (loading && !stalled) return <StalledOrdersSkeleton />;

  const handleDelivered = () => {
    selection.clear();
    void refetch();
    void invalidateClient(ORDER_DELIVERY_CACHE_FIELDS);
  };

  return (
    <PageContent>
      <Breadcrumb.Root>
        <Breadcrumb.Item href="/orders">Pedidos</Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>Pedidos parados</Breadcrumb.Item>
      </Breadcrumb.Root>

      <PanelHeader.Root>
        <PanelHeader.Top>
          <PanelHeader.Left>
            <PanelHeader.Title>Pedidos parados</PanelHeader.Title>
            <PanelHeader.Description>
              {stalled
                ? `${total} pedido(s) · ${formatMoney(sumAmount([...awaitingDelivery, ...awaitingInvoice]))}. Enquanto um pedido está parado, o cliente fica fora da rotina naquela fábrica.`
                : "Pedidos que seguram o cliente fora da rotina."}
            </PanelHeader.Description>
          </PanelHeader.Left>
        </PanelHeader.Top>
      </PanelHeader.Root>

      {error && !stalled ? (
        <QueryError onRetry={() => refetch()} />
      ) : (
        <div className="flex flex-col gap-20">
          <AwaitingDeliveryTable
            orders={awaitingDelivery}
            defaultDeliveryDays={stalled?.defaultDeliveryDays ?? 30}
            todayIso={todayIso}
            selectedIds={selected}
            onToggle={(id) => selection.toggle(DELIVERY_SCOPE, id)}
            onToggleAll={() =>
              selection.toggleAll(
                DELIVERY_SCOPE,
                awaitingDelivery.map((order) => order.id)
              )
            }
          />
          <AwaitingInvoiceTable orders={awaitingInvoice} todayIso={todayIso} />
        </div>
      )}

      <SelectionBar
        count={selection.count}
        noun={{
          singular: "pedido selecionado",
          plural: "pedidos selecionados",
        }}
        scopeLabel="Faturados sem entrega confirmada"
        onClear={selection.clear}
      >
        <DeliverOrdersModal orderIds={selection.ids} onDone={handleDelivered} />
      </SelectionBar>
    </PageContent>
  );
}
