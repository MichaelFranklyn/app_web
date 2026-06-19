"use client";

import { Button } from "@/components/Button";
import { Title } from "@/components/Title";
import { EmptyState } from "@/components/EmptyState";
import { Loading } from "@/components/Loading";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation, useQuery } from "@apollo/client/react";
import { PackageSearch } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { VisitScheduleItem } from "../../interface";
import { STOCK_OBSERVATION_OPTIONS, formatDayLabel } from "../../utils";
import {
  LAST_CLIENT_ORDER_QUERY,
  ORDER_ITEMS_FOR_STOCK_QUERY,
  SAVE_VISIT_STOCK_OBSERVATIONS_MUTATION,
  VISIT_STOCK_OBSERVATIONS_QUERY,
} from "./gql";

interface LastOrderData {
  orders: { edges: { node: { id: string; orderDate: string } }[] };
}
interface OrderItemsData {
  orderItems: {
    edges: {
      node: { id: string; product: { id: string; name: string; sku: string } | null };
    }[];
  };
}
interface ObsData {
  visitStockObservations: {
    edges: { node: { id: string; productId: string; observation: string } }[];
  };
}

interface Props {
  item: VisitScheduleItem;
}

export function StockObservationTab({ item }: Props) {
  const clientId = item.clientFactoryLink?.client?.id;
  const factoryId = item.clientFactoryLink?.factory?.id;

  const { data: orderData, loading: loadingOrder } = useQuery<LastOrderData>(
    LAST_CLIENT_ORDER_QUERY,
    {
      variables: {
        input: {
          first: 1,
          order: { by: "order_date", dir: "desc" },
          filters: [
            { field: "client_id", operator: "eq", value: clientId },
            { field: "factory_id", operator: "eq", value: factoryId },
          ],
        },
      },
      skip: !clientId || !factoryId,
    }
  );

  const lastOrder = orderData?.orders.edges[0]?.node ?? null;

  const { data: itemsData, loading: loadingItems } = useQuery<OrderItemsData>(
    ORDER_ITEMS_FOR_STOCK_QUERY,
    { variables: { orderId: lastOrder?.id }, skip: !lastOrder?.id }
  );

  const {
    data: obsData,
    loading: loadingObs,
    refetch: refetchObs,
  } = useQuery<ObsData>(VISIT_STOCK_OBSERVATIONS_QUERY, {
    variables: { itemId: item.id, input: { first: 100 } },
  });

  const products = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: string; name: string; sku: string }[] = [];
    for (const edge of itemsData?.orderItems.edges ?? []) {
      const p = edge.node.product;
      if (p && !seen.has(p.id)) {
        seen.add(p.id);
        list.push(p);
      }
    }
    return list;
  }, [itemsData]);

  const [obsMap, setObsMap] = useState<Record<string, string>>({});
  useEffect(() => {
    const init: Record<string, string> = {};
    for (const edge of obsData?.visitStockObservations.edges ?? []) {
      init[edge.node.productId] = edge.node.observation;
    }
    setObsMap(init);
  }, [obsData]);

  const [save] = useMutation(SAVE_VISIT_STOCK_OBSERVATIONS_MUTATION);
  const { execute, isLoading } = useAsyncAction();

  const toggle = (productId: string, value: string) => {
    setObsMap((prev) => ({
      ...prev,
      [productId]: prev[productId] === value ? "" : value,
    }));
  };

  const selectedCount = Object.values(obsMap).filter(Boolean).length;

  const handleSave = async () => {
    const observations = products
      .filter((p) => obsMap[p.id])
      .map((p) => ({ productId: p.id, observation: obsMap[p.id] }));

    await execute(
      async () => {
        const res = await save({
          variables: { itemId: item.id, observations },
        });
        const payload = (
          res.data as {
            saveVisitStockObservations?: { status: boolean; message: string };
          }
        )?.saveVisitStockObservations;
        if (!payload?.status) {
          throw new Error(payload?.message ?? "Erro ao salvar observações");
        }
        return payload;
      },
      {
        successMessage: "Observações de estoque salvas",
        onSuccess: () => refetchObs(),
      }
    );
  };

  const loading = loadingOrder || loadingItems || loadingObs;

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loading.Spinner />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div>
        <EmptyState.Root>
          <EmptyState.Icon>
            <PackageSearch />
          </EmptyState.Icon>
          <EmptyState.Title>Nenhum produto para observar</EmptyState.Title>
          <EmptyState.Description>
            Este cliente ainda não tem pedidos nesta fábrica, então não há
            produtos do último pedido para registrar a observação de estoque.
          </EmptyState.Description>
        </EmptyState.Root>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <Title variant="body-sm" color="muted">
        Produtos do último pedido
        {lastOrder ? ` (${formatDayLabel(lastOrder.orderDate)})` : ""} — marque
        como está o estoque de cada um.
      </Title>

      <div className="flex flex-col gap-8">
        {products.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between gap-12 rounded-(--r-md) border border-(--border) bg-(--bg3) px-12 py-10"
          >
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-(--text)">
                {p.name}
              </div>
              <div className="text-[12px] text-(--muted)">{p.sku}</div>
            </div>
            <div className="flex shrink-0 gap-4">
              {STOCK_OBSERVATION_OPTIONS.map((opt) => {
                const active = obsMap[p.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggle(p.id, opt.value)}
                    className={`rounded-(--r-sm) border px-8 py-4 text-[12px] transition-colors ${
                      active
                        ? "border-(--amber) bg-(--amber) text-black"
                        : "border-(--border) text-(--muted) hover:border-(--border2)"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Title variant="body-xs" color="muted">
          {selectedCount} de {products.length} marcados
        </Title>
        <Button.Root
          type="button"
          appearance="solid"
          color="amber"
          size="md"
          noUppercase
          loading={isLoading}
          onClick={handleSave}
        >
          <Button.Title>Salvar observações</Button.Title>
        </Button.Root>
      </div>
    </div>
  );
}
