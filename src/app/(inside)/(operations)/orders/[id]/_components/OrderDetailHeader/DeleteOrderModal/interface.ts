export interface DeleteOrderResponse {
  deleteOrder: {
    status: boolean;
    code: number;
    message: string;
  };
}

export interface DeleteOrderModalProps {
  orderId: string;
}
