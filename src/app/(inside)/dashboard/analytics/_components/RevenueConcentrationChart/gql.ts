import { gql } from "@apollo/client";

export const REVENUE_CONCENTRATION_QUERY = gql`
  query RevenueConcentrationByClient(
    $from: Date
    $to: Date
    $sellerId: UUID
    $limit: Int
  ) {
    revenueConcentrationByClient(
      from: $from
      to: $to
      sellerId: $sellerId
      limit: $limit
    ) {
      entityId
      entityName
      total
      share
      cumulativeShare
    }
  }
`;
