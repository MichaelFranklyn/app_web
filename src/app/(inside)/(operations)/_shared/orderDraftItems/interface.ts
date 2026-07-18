/** Desconto digitado em reais ou em porcentagem do valor do item. */
export type DiscountType = "VALUE" | "PERCENT";

/** Item em construção no passo 2 do wizard, antes de o pedido existir. */
export interface DraftItem {
  productId: string;
  productLabel: string;
  tierId: string;
  tierLabel: string;
  /** Preço por unidade (peça), número já desmascarado. */
  unitPrice: number;
  /** Quantidade em unidades (peças). */
  quantity: number;
  /** Desconto em reais — é o que o backend recebe, venha de % ou de valor. */
  discount: number;
  /** O que o vendedor digitou (5 = "5%" ou "R$ 5"), para reabrir na edição. */
  discountInput: number;
  discountType: DiscountType;
  /** Alíquota de IPI do item (%); 0 quando a fábrica não cobra IPI no pedido. */
  ipiRate: number;
  /** Produto+nível em promoção relâmpago no momento em que o item foi montado. */
  isPromo: boolean;
}

export interface CreateOrderItemResponse {
  createOrderItem: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}
