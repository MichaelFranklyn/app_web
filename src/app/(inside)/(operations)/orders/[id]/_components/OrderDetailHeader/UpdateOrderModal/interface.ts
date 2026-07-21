import { OrderStatus } from "../../../../interface";

export interface UpdateOrderInput {
  status?: string | null;
  notes?: string | null;
  freightType?: string | null;
  deliveryEstimateDays?: number | null;
}

export interface UpdateOrderResponse {
  updateOrder: {
    __typename?: "OrderTypeDataResponse";
    status: boolean;
    code: number;
    message: string;
    data: {
      __typename?: "OrderType";
      id: string;
      status: OrderStatus;
      freightType: string | null;
      notes: string | null;
      fileUrl: string | null;
      isFileParsed: boolean;
      deliveryEstimateDays: number | null;
      estimatedDeliveryDate: string | null;
      isDeliveryOverdue: boolean;
    } | null;
  };
}

export interface UpdateOrderModalProps {
  orderId: string;
  currentNotes: string | null;
  currentFreightType: string | null;
  currentStatus: OrderStatus;
  currentFileUrl: string | null;
  currentFileParsed: boolean;
  currentDeliveryEstimateDays: number | null;
  onSuccess: () => void;
}
