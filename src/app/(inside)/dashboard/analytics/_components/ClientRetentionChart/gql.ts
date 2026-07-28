import { gql } from "@apollo/client";

export const CLIENT_RETENTION_QUERY = gql`
  query ClientRetentionByMonth($from: Date, $to: Date, $sellerId: UUID) {
    clientRetentionByMonth(from: $from, to: $to, sellerId: $sellerId) {
      month
      activeClients
      retainedClients
      retentionRate
    }
  }
`;
