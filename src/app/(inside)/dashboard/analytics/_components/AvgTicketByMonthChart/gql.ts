import { gql } from "@apollo/client";

export const AVG_TICKET_BY_MONTH_QUERY = gql`
  query AvgTicketByMonth($from: Date, $to: Date, $sellerId: UUID) {
    avgTicketByMonth(from: $from, to: $to, sellerId: $sellerId) {
      month
      avgTicket
      orderCount
    }
  }
`;
