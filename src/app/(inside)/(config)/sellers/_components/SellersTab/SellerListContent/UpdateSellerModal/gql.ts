import { gql } from "@apollo/client";

export const UPDATE_SELLER_MUTATION = gql`
  mutation UpdateSeller($id: UUID!, $input: UpdateSellerInput!) {
    updateSeller(id: $id, input: $input) {
      status
      message
      data {
        id
        name
        phone
        region
        homeCep
        homeStreet
        homeNumber
        homeComplement
        homeNeighborhood
        homeCity
        homeState
        isActive
      }
    }
  }
`;
