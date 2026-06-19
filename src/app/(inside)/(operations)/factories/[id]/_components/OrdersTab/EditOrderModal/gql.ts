import { gql } from "@apollo/client";

export const UPDATE_ORDER_MUTATION = gql`
  mutation UpdateOrderFromFactory($id: UUID!, $input: UpdateOrderInput!) {
    updateOrder(id: $id, input: $input) {
      status
      code
      message
      data {
        id
        status
        notes
      }
    }
  }
`;
