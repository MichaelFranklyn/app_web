import type { OrderStatus } from "@/app/(inside)/_shared/orderStatus";

/** Uma linha do relatório de vendas: um pedido faturado. */
export interface SalesReportOrder {
  id: string;
  orderDate: string;
  /** Nunca nulo neste relatório — é o campo pelo qual o período recorta. */
  invoicedAt: string | null;
  totalAmount: string;
  commissionAmount: string;
  status: OrderStatus;
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

export interface SalesReportOrdersResponse {
  sales_report_orders: {
    edges: { node: SalesReportOrder }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  };
}

export interface SalesReportStatsResponse {
  sales_report_stats: {
    totalOrders: number;
    totalAmount: string;
    avgTicket: string;
    commissionAmount: string;
  };
}

export interface InvoicedByFactoryPoint {
  entityId: string;
  entityName: string;
  total: string;
  orderCount: number;
  commissionAmount: string;
}

export interface InvoicedByFactoryResponse {
  invoicedRevenueByFactory: InvoicedByFactoryPoint[];
}

export interface InvoicedByMonthPoint {
  month: string;
  total: string;
  orderCount: number;
  commissionAmount: string;
}

export interface InvoicedByMonthResponse {
  invoicedRevenueByMonth: InvoicedByMonthPoint[];
}
