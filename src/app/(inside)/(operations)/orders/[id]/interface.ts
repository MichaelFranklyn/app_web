import { OrderStatus } from "../interface";

export interface OrderDetailResponse {
  order: {
    status: boolean;
    code: number;
    message: string;
    data: OrderDetail | null;
  };
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
