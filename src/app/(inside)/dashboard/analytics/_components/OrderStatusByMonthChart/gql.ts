import { gql } from "@apollo/client";

export const ORDER_STATUS_BY_MONTH_QUERY = gql`
  query OrderStatusByMonth($from: Date, $to: Date, $sellerId: UUID) {
    orderStatusByMonth(from: $from, to: $to, sellerId: $sellerId) {
      month
      quotes
      confirmed
      invoiced
      delivered
      cancelled
    }
  }
`;
