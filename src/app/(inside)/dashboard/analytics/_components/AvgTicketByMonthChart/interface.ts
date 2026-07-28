export interface AvgTicketByMonthPoint {
  month: string;
  avgTicket: string;
  orderCount: number;
}

export interface AvgTicketByMonthResponse {
  avgTicketByMonth: AvgTicketByMonthPoint[];
}
