import { gql } from "@apollo/client";

export const SELLERS_STATS_QUERY = gql`
  query sellersStats {
    sellersStats {
      totalCount
      activeCount
      activeFactoryAccessCount
      inactiveFactoryAccessCount
    }
  }
`;

// Edição de vendedor — compartilhada pela lista (UpdateSellerModal) e pelo
// detalhe (sellers/[id] EditSellerModal).
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
