export interface ItemsPerOrderPoint {
  entityId: string;
  entityName: string;
  /** Média de itens (produtos diferentes) por pedido da fábrica. */
  avgItems: number;
  /** Média de peças (unidades) por pedido da fábrica. */
  avgUnits: number;
  orderCount: number;
}

export interface ItemsPerOrderResponse {
  itemsPerOrderByFactory: ItemsPerOrderPoint[];
}
