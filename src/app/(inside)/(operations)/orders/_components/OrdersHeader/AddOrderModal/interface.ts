import { Order } from "../../../interface";

export interface CreateOrderInput {
  sellerId: string;
  clientId: string;
  factoryId: string;
  orderDate: string;
  notes?: string | null;
  freightType?: string | null;
}

export interface CreateOrderResponse {
  createOrder: {
    status: boolean;
    code: number;
    message: string;
    data: Order | null;
  };
}
