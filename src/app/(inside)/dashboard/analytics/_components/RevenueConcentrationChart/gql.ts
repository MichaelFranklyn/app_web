import { gql } from "@apollo/client";

export const REVENUE_CONCENTRATION_QUERY = gql`
  query RevenueConcentrationByClient(
    $from: Date
    $to: Date
    $sellerId: UUID
    $factoryId: UUID
    $limit: Int
  ) {
    revenueConcentrationByClient(
      from: $from
      to: $to
      sellerId: $sellerId
      factoryId: $factoryId
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
