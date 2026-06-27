import { gql } from "@apollo/client";

export const UPDATE_ORDER_FROM_FACTORY_MUTATION = gql`
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

export const UPDATE_ORDER_FROM_CLIENT_MUTATION = gql`
  mutation UpdateOrderFromClient($id: UUID!, $input: UpdateOrderInput!) {
    updateOrder(id: $id, input: $input) {
      status
      code
      message
      data {
        id
        notes
      }
    }
  }
`;
