export interface BackorderMonthPoint {
  month: string; // "YYYY-MM"
  /** Pedidos que são venda nova (sem pedido-pai). */
  newOrders: number;
  /** Pedidos que são sobra de um faturamento parcial. */
  backorders: number;
  /** Fatia dos pedidos do mês que é sobra (0..1). */
  backorderShare: number;
  /** Valor que está nas sobras do mês. */
  backorderAmount: string;
}

export interface BackorderByMonthResponse {
  backorderByMonth: BackorderMonthPoint[];
}
