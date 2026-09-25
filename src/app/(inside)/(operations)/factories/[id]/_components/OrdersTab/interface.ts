// Resposta da criação de pedido do ImportOrderModal da aba.
export interface CreateOrderResponse {
  createOrder: {
    status: boolean;
    code: number;
    message: string;
    data: {
      id: string;
      orderDate: string;
      totalAmount: string;
      commissionAmount: string;
      status: string;
      seller: { id: string; name: string } | null;
      client: {
        id: string;
        razaoSocial: string;
        nomeFantasia: string | null;
      } | null;
    } | null;
  };
}
