export interface OrdersByMonthPoint {
  month: string;
  count: number;
}

export interface OrdersByMonthResponse {
  ordersByMonth: OrdersByMonthPoint[];
}
