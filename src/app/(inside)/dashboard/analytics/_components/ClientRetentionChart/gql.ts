import { gql } from "@apollo/client";

export const CLIENT_RETENTION_QUERY = gql`
  query ClientRetentionByMonth(
    $from: Date
    $to: Date
    $sellerId: UUID
    $factoryId: UUID
  ) {
    clientRetentionByMonth(
      from: $from
      to: $to
      sellerId: $sellerId
      factoryId: $factoryId
    ) {
      month
      activeClients
      retainedClients
      retentionRate
    }
  }
`;
