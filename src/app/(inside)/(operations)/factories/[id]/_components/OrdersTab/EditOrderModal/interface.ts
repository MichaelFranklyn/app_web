export interface UpdateOrderInput {
  notes?: string | null;
}

export interface UpdateOrderResponse {
  updateOrder: {
    status: boolean;
    code: number;
    message: string;
    data: {
      id: string;
      notes: string | null;
    } | null;
  };
}

export interface EditOrderModalProps {
  orderId: string;
  initialNotes: string | null;
}
