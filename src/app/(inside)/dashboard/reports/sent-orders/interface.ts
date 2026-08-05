import type { OrderStatus } from "@/app/(inside)/_shared/orderStatus";

/** Uma linha do relatório: um pedido colocado na fábrica. */
export interface SentOrder {
  id: string;
  orderDate: string;
  /** Nulo enquanto a fábrica não faturou — é o pedido ainda pendente lá. */
  invoicedAt: string | null;
  totalAmount: string;
  commissionAmount: string;
  status: OrderStatus;
  /** Faturado, prazo de entrega vencido e não entregue. */
  isDeliveryOverdue: boolean;
  seller: { id: string; name: string } | null;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
  factory: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    nickname: string | null;
  } | null;
}

export interface SentOrdersResponse {
  sent_orders_report: {
    edges: { node: SentOrder }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  };
}

export interface SentOrdersStatsResponse {
  sent_orders_report_stats: {
    totalOrders: number;
    totalAmount: string;
    avgTicket: string;
    invoicedOrders: number;
    invoicedAmount: string;
  };
}

export interface PlacedByFactoryPoint {
  entityId: string;
  entityName: string;
  orderCount: number;
  total: string;
  invoicedCount: number;
  invoicedAmount: string;
}

export interface PlacedByFactoryResponse {
  placedOrdersByFactory: PlacedByFactoryPoint[];
}
