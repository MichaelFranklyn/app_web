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
  discount: number;
  /** Alíquota de IPI do item (%); 0 quando a fábrica não cobra IPI no pedido. */
  ipiRate: number;
}

export interface CreateOrderItemResponse {
  createOrderItem: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}
