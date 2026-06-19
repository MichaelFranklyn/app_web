import { gql } from "@apollo/client";

export const USERS_OPTIONS_QUERY = gql`
  query UsersForSellerModal($input: BaseListInput!) {
    users_for_seller: users(input: $input) {
      edges {
        node {
          id
          name
          email
        }
      }
    }
  }
`;

export const SELLERS_USER_IDS_QUERY = gql`
  query SellersUserIds($input: BaseListInput!) {
    sellers_user_ids: sellers(input: $input) {
      edges {
        node {
          userId
        }
      }
    }
  }
`;

export const CREATE_SELLER_MUTATION = gql`
  mutation CreateSeller($input: CreateSellerInput!) {
    createSeller(input: $input) {
      status
      message
      data {
        id
        name
        phone
        region
        isActive
        factoryCount
        clientCount
        totalRevenue
        lastOrderDate
      }
    }
  }
`;
