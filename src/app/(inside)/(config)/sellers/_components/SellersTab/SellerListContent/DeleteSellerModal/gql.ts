import { gql } from "@apollo/client";

export const DELETE_SELLER_MUTATION = gql`
  mutation DeleteSeller($id: UUID!) {
    deleteSeller(id: $id) {
      status
      message
    }
  }
`;
