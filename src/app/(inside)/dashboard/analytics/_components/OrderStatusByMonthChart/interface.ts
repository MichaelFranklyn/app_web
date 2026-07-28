export interface OrderStatusByMonthPoint {
  month: string;
  quotes: number;
  confirmed: number;
  invoiced: number;
  delivered: number;
  cancelled: number;
}

export interface OrderStatusByMonthResponse {
  orderStatusByMonth: OrderStatusByMonthPoint[];
}
