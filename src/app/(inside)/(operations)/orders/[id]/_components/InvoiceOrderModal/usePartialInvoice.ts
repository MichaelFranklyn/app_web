import { useQuery } from "@apollo/client/react";
import { useEffect, useMemo, useState } from "react";

import { ORDER_ITEMS_QUERY } from "../../gql";
import { OrderItem, OrderItemsResponse } from "../../interface";
import {
  backorderItemCount,
  buildInvoiceItemsInput,
  validatePartialInvoice,
} from "../../utils";

/** Item enviado ao faturar parcial (quantidade faturada em unidades). */
export interface InvoiceItemInput {
  orderItemId: string;
  invoicedQuantity: string;
}

/** Destino do que a fábrica não faturou: virar um novo pedido ou ser cancelado. */
export type RemainderMode = "backorder" | "cancel";

/**
 * Estado do faturamento parcial: carrega os itens do pedido, guarda a quantidade
 * faturada por item (começa igual à pedida) e monta/valida o payload. Só carrega
 * com o modal aberto. `partial=false` → fatura o pedido inteiro (sem `items`).
 */
export function usePartialInvoice(orderId: string, open: boolean) {
  const { data, loading } = useQuery<OrderItemsResponse>(ORDER_ITEMS_QUERY, {
    variables: { orderId },
    skip: !open,
  });

  const items: OrderItem[] = useMemo(
    () => data?.orderItems?.edges?.map((e) => e.node) ?? [],
    [data]
  );

  const [partial, setPartial] = useState(false);
  // Quantidade faturada por item (string p/ o input); default = quantidade pedida.
  const [quantities, setQuantities] = useState<Record<string, string>>({});
  // O que fazer com a sobra. Padrão: gerar o pedido-filho (nada se perde).
  const [remainderMode, setRemainderMode] =
    useState<RemainderMode>("backorder");

  useEffect(() => {
    setQuantities(Object.fromEntries(items.map((it) => [it.id, it.quantity])));
  }, [items]);

  const setQuantity = (id: string, value: string) =>
    setQuantities((prev) => ({ ...prev, [id]: value }));

  const reset = () => {
    setPartial(false);
    setRemainderMode("backorder");
    setQuantities(Object.fromEntries(items.map((it) => [it.id, it.quantity])));
  };

  // Quantos itens têm sobra (faturado < pedido) — vão para o backorder.
  const backorderCount = useMemo(
    () => (partial ? backorderItemCount(items, quantities) : 0),
    [partial, items, quantities]
  );

  const validation = useMemo<{ ok: boolean; error?: string }>(
    () => (partial ? validatePartialInvoice(items, quantities) : { ok: true }),
    [partial, items, quantities]
  );

  /** Payload `items` para o backend, ou null quando fatura o pedido inteiro. */
  const buildItemsInput = (): InvoiceItemInput[] | null =>
    partial ? buildInvoiceItemsInput(items, quantities) : null;

  /** Cancelar o saldo só faz sentido quando é parcial e sobrou alguma coisa. */
  const cancelRemainder =
    partial && remainderMode === "cancel" && backorderCount > 0;

  return {
    items,
    loading,
    partial,
    setPartial,
    quantities,
    setQuantity,
    reset,
    backorderCount,
    remainderMode,
    setRemainderMode,
    cancelRemainder,
    validation,
    buildItemsInput,
  };
}
