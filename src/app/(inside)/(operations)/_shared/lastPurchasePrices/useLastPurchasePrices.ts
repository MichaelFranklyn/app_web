import { useQuery } from "@apollo/client/react";
import { useMemo } from "react";

import { CLIENT_PRODUCT_PURCHASE_PRICES_QUERY } from "./gql";
import { ClientProductPurchasePricesData, PurchasePrice } from "./interface";

interface Options {
  open: boolean;
  clientId?: string | null;
  factoryId?: string | null;
  productIds: string[];
  /** O pedido em edição: não pode ser "a última compra" de si mesmo. */
  excludeOrderId?: string | null;
}

/**
 * O preço das últimas compras destes produtos pelo cliente, nesta fábrica, por
 * produto. Sem cliente ou fábrica não há o que perguntar.
 */
export function useLastPurchasePrices({
  open,
  clientId,
  factoryId,
  productIds,
  excludeOrderId,
}: Options) {
  const { data, loading } = useQuery<ClientProductPurchasePricesData>(
    CLIENT_PRODUCT_PURCHASE_PRICES_QUERY,
    {
      variables: {
        clientId,
        factoryId,
        productIds,
        excludeOrderId: excludeOrderId ?? null,
      },
      skip: !open || !clientId || !factoryId || productIds.length === 0,
    }
  );

  const byProduct = useMemo(() => {
    const map = new Map<string, PurchasePrice[]>();
    for (const entry of data?.clientProductPurchasePrices ?? []) {
      map.set(entry.productId, entry.purchases);
    }
    return map;
  }, [data]);

  return { byProduct, loading };
}
