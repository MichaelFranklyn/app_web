export interface OrderSizeBandPoint {
  band: string;
  label: string;
  orderCount: number;
  totalAmount: string;
  /** Fatia dos pedidos do período que caiu nesta faixa (0..1). */
  share: number;
}

export interface OrderSizeDistributionResponse {
  orderSizeDistribution: OrderSizeBandPoint[];
}
