import { gql } from "@apollo/client";

export const CLIENTS_AT_RISK_QUERY = gql`
  query ClientsAtRisk(
    $from: Date
    $to: Date
    $sellerId: UUID
    $factoryId: UUID
    $limit: Int
  ) {
    clientsAtRisk(
      from: $from
      to: $to
      sellerId: $sellerId
      factoryId: $factoryId
      limit: $limit
    ) {
      entityId
      entityName
      lastOrderDate
      daysSinceLastOrder
      avgIntervalDays
      riskRatio
      orderCount
    }
  }
`;
