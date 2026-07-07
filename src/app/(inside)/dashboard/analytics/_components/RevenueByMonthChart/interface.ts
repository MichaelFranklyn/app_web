export interface RevenueByMonthPoint {
  month: string;
  total: string;
}

export interface RevenueByMonthResponse {
  revenueByMonth: RevenueByMonthPoint[];
}
