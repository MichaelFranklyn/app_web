/** Uma fábrica e o que foi colocado nela no período. */
export interface FactoryOrdersRow {
  entityId: string;
  entityName: string;
  orderCount: number;
  totalAmount: string;
  avgTicket: string;
  clientCount: number;
  invoicedCount: number;
  invoicedAmount: string;
  commissionAmount: string;
  lastOrderDate: string | null;
  /** Fatia da fábrica no total colocado no período (0 a 1). */
  share: number;
}

export interface FactoryOrdersResponse {
  factoryOrdersReport: FactoryOrdersRow[];
}
