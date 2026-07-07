import { OrderStatus } from "../interface";

export interface OrderDetailResponse {
  order: {
    status: boolean;
    code: number;
    message: string;
    data: OrderDetail | null;
  };
}

export type InstallmentStatus = "PENDING" | "PAID" | "CANCELLED";

export interface PaymentTermRef {
  id: string;
  name: string;
  installmentsDays: number[];
}

export interface OrderInstallment {
  id: string;
  sequence: number;
  amount: string;
  commissionAmount: string;
  dueDate: string | null;
  status: InstallmentStatus;
  paidAt: string | null;
  isCommissionReceived: boolean;
  commissionReceivedAt: string | null;
}

export interface OrderDetail {
  id: string;
  orderDate: string;
  totalAmount: string;
  commissionAmount: string;
  status: OrderStatus;
  fileUrl: string | null;
  isFileParsed: boolean;
  notes: string | null;
  freightType: "FOB" | "CIF" | null;
  createdAt: string;
  invoicedAt: string | null;
  paymentTermId: string | null;
  commissionCalcBasis: string | null;
  seller: { id: string; name: string } | null;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
  paymentTerm: PaymentTermRef | null;
  availablePaymentTerms: PaymentTermRef[];
  installments: OrderInstallment[];
}

export interface OrderItemsResponse {
  orderItems: {
    edges: { node: OrderItem }[];
    totalCount: number;
  };
}

export interface OrderItem {
  id: string;
  quantity: string;
  unitsTotal: string;
  unitPrice: string;
  discount: string;
  subtotal: string;
  avgShelfDays: number | null;
  source: "MANUAL" | "IMPORTED" | "TEMPLATE";
  product: { id: string; name: string; saleMultiple: string | null } | null;
  tier: { id: string; name: string } | null;
}
