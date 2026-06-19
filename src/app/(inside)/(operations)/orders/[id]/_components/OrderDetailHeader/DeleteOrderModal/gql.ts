import { gql } from "@apollo/client";

export const DELETE_ORDER_MUTATION = gql`
  mutation DeleteOrder($id: UUID!) {
    deleteOrder(id: $id) {
      status
      code
      message
    }
  }
`;
