import { gql } from "@apollo/client";

export const REVENUE_BY_MONTH_QUERY = gql`
  query RevenueByMonth($from: Date, $to: Date, $sellerId: UUID) {
    revenueByMonth(from: $from, to: $to, sellerId: $sellerId) {
      month
      total
    }
  }
`;
