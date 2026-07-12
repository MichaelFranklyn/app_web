import { OrderItem } from "../../../interface";

export interface CreateOrderItemResponse {
  createOrderItem: {
    status: boolean;
    message: string;
    data: OrderItem | null;
  };
}
