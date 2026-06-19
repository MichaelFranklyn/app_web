import { gql } from "@apollo/client";

export const SELLER_DETAIL_QUERY = gql`
  query SellerDetail($id: UUID!) {
    seller_detail: seller(id: $id) {
      status
      message
      data {
        id
        name
        phone
        cpf
        region
        homeCep
        homeStreet
        homeNumber
        homeComplement
        homeNeighborhood
        homeCity
        homeState
        isActive
        factoryCount
        clientCount
        totalRevenue
        lastOrderDate
        createdAt
        user {
          id
          email
        }
      }
    }
  }
`;
