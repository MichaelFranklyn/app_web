import { gql } from "@apollo/client";

export const VISIT_CONVERSION_QUERY = gql`
  query VisitConversionByMonth($from: Date, $to: Date, $sellerId: UUID) {
    visitConversionByMonth(from: $from, to: $to, sellerId: $sellerId) {
      month
      visits
      ordersFromVisits
      conversionRate
    }
  }
`;
