import { gql } from "@apollo/client";

export const CLIENTS_AT_RISK_QUERY = gql`
  query ClientsAtRisk($from: Date, $to: Date, $sellerId: UUID, $limit: Int) {
    clientsAtRisk(from: $from, to: $to, sellerId: $sellerId, limit: $limit) {
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
