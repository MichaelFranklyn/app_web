import { gql } from "@apollo/client";

export const REVENUE_BY_FACTORY_QUERY = gql`
  query RevenueByFactory(
    $from: Date
    $to: Date
    $sellerId: UUID
    $factoryId: UUID
    $limit: Int
  ) {
    revenueByFactory(
      from: $from
      to: $to
      sellerId: $sellerId
      factoryId: $factoryId
      limit: $limit
    ) {
      factoryId
      factoryName
      total
    }
  }
`;
