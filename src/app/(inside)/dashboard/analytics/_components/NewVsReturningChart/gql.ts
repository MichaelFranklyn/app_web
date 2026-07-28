import { gql } from "@apollo/client";

export const NEW_VS_RETURNING_QUERY = gql`
  query NewVsReturningClientsByMonth($from: Date, $to: Date, $sellerId: UUID) {
    newVsReturningClientsByMonth(from: $from, to: $to, sellerId: $sellerId) {
      month
      newClients
      returningClients
    }
  }
`;
