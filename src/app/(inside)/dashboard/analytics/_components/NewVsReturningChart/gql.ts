import { gql } from "@apollo/client";

export const NEW_VS_RETURNING_QUERY = gql`
  query NewVsReturningClientsByMonth(
    $from: Date
    $to: Date
    $sellerId: UUID
    $factoryId: UUID
  ) {
    newVsReturningClientsByMonth(
      from: $from
      to: $to
      sellerId: $sellerId
      factoryId: $factoryId
    ) {
      month
      newClients
      returningClients
    }
  }
`;
