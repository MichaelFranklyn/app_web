import { gql } from "@apollo/client";

export const ORDERS_BY_MONTH_QUERY = gql`
  query OrdersByMonth($from: Date, $to: Date, $sellerId: UUID) {
    ordersByMonth(from: $from, to: $to, sellerId: $sellerId) {
      month
      count
    }
  }
`;
