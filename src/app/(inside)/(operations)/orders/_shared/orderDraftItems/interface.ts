/** Item em construção no passo 2 do wizard, antes de o pedido existir. */
export interface DraftItem {
  productId: string;
  productLabel: string;
  tierId: string;
  tierLabel: string;
  /** Preço da embalagem fechada (número, já desmascarado). */
  unitPrice: number;
  /** Quantidade em embalagens. */
  quantity: number;
  discount: number;
}

export interface CreateOrderItemResponse {
  createOrderItem: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}
