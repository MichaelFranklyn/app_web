// Ponto de contagem de pedidos por entidade (fábrica), vindo do backend.
export interface OrderCountPoint {
  entityId: string;
  entityName: string;
  orderCount: number;
}

export interface OrdersByFactoryResponse {
  ordersByFactory: OrderCountPoint[];
}
