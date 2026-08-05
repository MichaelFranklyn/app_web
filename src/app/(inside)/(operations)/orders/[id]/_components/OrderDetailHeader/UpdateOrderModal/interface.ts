import { OrderStatus } from "../../../../interface";
import { PaymentTermRef } from "../../../interface";

export interface UpdateOrderInput {
  status?: string | null;
  notes?: string | null;
  freightType?: string | null;
  deliveryEstimateDays?: number | null;
  paymentTermId?: string | null;
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
      paymentTermId: string | null;
      paymentTerm: PaymentTermRef | null;
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
  /** Dias que o vendedor estimou que este pedido dura. Ver @/utils/cadence. */
  currentCoverageDays: number | null;
  currentPaymentTermId: string | null;
  /** Condições de pagamento da fábrica deste pedido. */
  paymentTerms: PaymentTermRef[];
  onSuccess: () => void;
}
