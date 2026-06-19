export type OrderStatus = "DRAFT" | "SENT" | "CONFIRMED" | "DELIVERED" | "CANCELLED";

export interface Order {
  id: string;
  orderDate: string;
  totalAmount: string;
  commissionAmount: string;
  status: OrderStatus;
  seller: { id: string; name: string } | null;
  client: { id: string; razaoSocial: string; nomeFantasia: string | null } | null;
  factory: { id: string; nomeFantasia: string | null; razaoSocial: string } | null;
}

export interface OrdersStats {
  orderStats: {
    totalOrders: number;
    totalAmount: string;
    avgTicket: string;
  };
}

export interface QueryData {
  orders_list: {
    edges: { node: Order }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  };
}
