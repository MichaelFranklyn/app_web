import { OrderStatus } from "../../../../interface";

export interface UpdateOrderInput {
  notes?: string | null;
  freightType?: string | null;
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
  onSuccess: () => void;
}
