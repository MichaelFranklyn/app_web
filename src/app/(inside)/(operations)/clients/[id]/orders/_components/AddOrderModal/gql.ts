import { gql } from "@apollo/client";

export const CREATE_ORDER_FROM_CLIENT_MUTATION = gql`
  mutation CreateOrderFromClient($input: CreateOrderInput!) {
    createOrder(input: $input) {
      status
      code
      message
      data {
        id
      }
    }
  }
`;

export const CLIENT_ASSIGNMENTS_QUERY = gql`
  query ClientAssignments($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          sellerId
          factoryId
          seller {
            id
            name
          }
          factory {
            id
            nomeFantasia
            razaoSocial
          }
        }
      }
    }
  }
`;
