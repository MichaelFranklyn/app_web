export interface OrdersAndTicketResponse {
  avgTicketByMonth: {
    month: string;
    avgTicket: string;
    /** Pedidos que compõem a média do mês — é a própria contagem do volume. */
    orderCount: number;
  }[];
}

/** Um mês com as duas grandezas do desenho. */
export interface OrdersAndTicketPoint {
  month: string; // "YYYY-MM"
  orderCount: number;
  avgTicket: number;
}
