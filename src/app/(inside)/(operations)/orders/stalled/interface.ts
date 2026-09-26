export interface StalledOrder {
  id: string;
  orderDate: string;
  invoicedAt: string | null;
  invoiceNumber: string | null;
  deliveryEstimateDays: number | null;
  totalAmount: string;
  status: string;
  seller: { id: string; name: string } | null;
  client: {
    id: string;
    razaoSocial: string | null;
    nomeFantasia: string | null;
  } | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    nickname: string | null;
    razaoSocial: string | null;
  } | null;
}

export interface StalledOrdersResponse {
  stalledOrders: {
    defaultDeliveryDays: number;
    awaitingDelivery: StalledOrder[];
    awaitingInvoice: StalledOrder[];
  };
}
