import { CreateOrderItemsResponse, DraftItem } from "./interface";

// Assinatura mínima da mutação `createOrderItems` do Apollo — o suficiente para
// o helper, sem acoplar aos genéricos do useMutation.
type CreateOrderItemsFn = (opts: {
  variables: { orderId: string; items: Record<string, unknown>[] };
}) => Promise<{ data?: CreateOrderItemsResponse | null }>;

/**
 * Grava os itens do rascunho depois que o pedido já existe (o backend não aceita
 * itens no CreateOrderInput) — numa chamada só, que é tudo ou nada. Se o lote é
 * recusado, levanta com a mensagem do backend ("Item 2 (Cimento): …"), que diz
 * qual linha travou; quem chama decide o que fazer com o pedido vazio.
 *
 * Compartilhado entre as origens do novo pedido — todas criam o pedido e, em
 * seguida, encadeiam os mesmos itens.
 */
export async function createDraftItems(
  createOrderItems: CreateOrderItemsFn,
  orderId: string,
  items: DraftItem[]
): Promise<void> {
  // A lista do wizard vem do mais novo para o mais antigo; o backend grava na
  // ordem recebida (o `created_at` cresce linha a linha), então mandamos do
  // mais antigo para o mais novo — o detalhe do pedido, ordenado do mais novo
  // para o mais antigo, mostra os itens na mesma ordem do wizard.
  const lines = [...items].reverse().map((item) => ({
    productId: item.productId,
    tierId: item.tierId || null,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    discount: item.discount,
    ipiRate: item.ipiRate,
    isPromo: item.isPromo,
    source: item.source ?? "MANUAL",
  }));
  const r = await createOrderItems({ variables: { orderId, items: lines } });
  const result = r.data?.createOrderItems;
  if (!result?.status) {
    throw new Error(
      result?.message ?? "Não foi possível gravar os itens do pedido."
    );
  }
}
