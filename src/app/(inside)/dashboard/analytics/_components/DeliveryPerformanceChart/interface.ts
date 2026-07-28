export interface DeliveryPerformancePoint {
  entityId: string;
  entityName: string;
  /** Nulo quando nenhum pedido entregue da fábrica tinha previsão cadastrada. */
  avgEstimatedDays: number | null;
  avgActualDays: number;
  lateRate: number;
  deliveredCount: number;
}

export interface DeliveryPerformanceResponse {
  deliveryPerformanceByFactory: DeliveryPerformancePoint[];
}
