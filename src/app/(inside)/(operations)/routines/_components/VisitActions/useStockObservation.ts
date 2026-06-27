import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import { VisitScheduleItem } from "../../interface";
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
      node: {
        id: string;
        product: { id: string; name: string; sku: string } | null;
      };
    }[];
  };
}
interface ObsData {
  visitStockObservations: {
    edges: { node: { id: string; productId: string; observation: string } }[];
  };
}

export function useStockObservation(item: VisitScheduleItem) {
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

  return {
    loading,
    products,
    lastOrder,
    obsMap,
    toggle,
    selectedCount,
    handleSave,
    isLoading,
  };
}
