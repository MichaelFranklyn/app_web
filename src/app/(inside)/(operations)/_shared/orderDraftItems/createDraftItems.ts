import { CreateOrderItemResponse, DraftItem } from "./interface";

// Assinatura mínima da mutação `createOrderItem` do Apollo — o suficiente para o
// helper, sem acoplar aos genéricos do useMutation.
type CreateOrderItemFn = (opts: {
  variables: { input: Record<string, unknown> };
}) => Promise<{ data?: CreateOrderItemResponse | null }>;

/**
 * Grava os itens do rascunho depois que o pedido já existe (o backend não aceita
 * itens no CreateOrderInput). Se algum item falhar, o pedido permanece criado e o
 * vendedor completa no detalhe; devolve os rótulos que falharam para avisar.
 *
 * Compartilhado entre o wizard de /orders e a criação de pedido a partir do
 * cliente — os dois criam o pedido e, em seguida, encadeiam os mesmos itens.
 */
export async function createDraftItems(
  createOrderItem: CreateOrderItemFn,
  orderId: string,
  items: DraftItem[]
): Promise<string[]> {
  const failed: string[] = [];
  for (const item of items) {
    try {
      const r = await createOrderItem({
        variables: {
          input: {
            orderId,
            productId: item.productId,
            tierId: item.tierId || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            ipiRate: item.ipiRate,
            source: "MANUAL",
          },
        },
      });
      if (!r.data?.createOrderItem?.status) failed.push(item.productLabel);
    } catch {
      failed.push(item.productLabel);
    }
  }
  return failed;
}
