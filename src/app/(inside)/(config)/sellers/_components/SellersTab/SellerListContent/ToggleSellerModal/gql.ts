import { gql } from "@apollo/client";

export const TOGGLE_SELLER_MUTATION = gql`
  mutation ToggleSeller($id: UUID!, $input: UpdateSellerInput!) {
    updateSeller(id: $id, input: $input) {
      status
      message
    }
  }
`;
