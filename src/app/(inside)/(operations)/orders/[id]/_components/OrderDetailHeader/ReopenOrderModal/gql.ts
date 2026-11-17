import { gql } from "@apollo/client";

export const REOPEN_ORDER_MUTATION = gql`
  mutation ReopenCancelledOrder($id: UUID!, $input: ReasonInput!) {
    reopenCancelledOrder(id: $id, input: $input) {
      status
      message
      data {
        id
        status
        cancelledAt
        cancelledByName
        cancelReason
      }
    }
  }
`;
