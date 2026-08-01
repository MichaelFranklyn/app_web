export interface WeekdayVolumePoint {
  /** 1 = segunda … 7 = domingo (ISO). */
  weekday: number;
  label: string;
  orderCount: number;
  totalAmount: string;
  /** Fatia dos pedidos do período fechada neste dia (0..1). */
  share: number;
}

export interface OrdersByWeekdayResponse {
  ordersByWeekday: WeekdayVolumePoint[];
}
