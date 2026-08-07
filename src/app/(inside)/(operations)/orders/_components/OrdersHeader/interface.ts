import { Order } from "../../interface";

export interface CreateOrderInput {
  sellerId: string;
  clientId: string;
  factoryId: string;
  orderDate: string;
  paymentTermId?: string | null;
  notes?: string | null;
  freightType?: string | null;
  // Prazo de entrega estimado (dias); null → herda o padrão da fábrica no backend.
  deliveryEstimateDays?: number | null;
  coverageDays?: number | null;
  // Quando true, o pedido nasce como ORÇAMENTO (rascunho) até ser convertido.
  isQuote?: boolean;
}

export interface CreateOrderResponse {
  createOrder: {
    status: boolean;
    code: number;
    message: string;
    data: Order | null;
  };
}
