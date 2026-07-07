// Ponto de contagem de pedidos por entidade (cliente), vindo do backend.
export interface OrderCountPoint {
  entityId: string;
  entityName: string;
  orderCount: number;
}

export interface OrdersByClientResponse {
  ordersByClient: OrderCountPoint[];
}
