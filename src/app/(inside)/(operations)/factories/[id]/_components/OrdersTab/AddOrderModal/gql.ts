import { gql } from "@apollo/client";

export const CREATE_ORDER_FROM_FACTORY_MUTATION = gql`
  mutation CreateOrderFromFactory($input: CreateOrderInput!) {
    createOrder(input: $input) {
      status
      code
      message
      data {
        id
        orderDate
        totalAmount
        commissionAmount
        status
        seller {
          id
          name
        }
        client {
          id
          razaoSocial
          nomeFantasia
        }
      }
    }
  }
`;

export const FACTORY_ASSIGNMENTS_QUERY = gql`
  query FactoryAssignments($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          sellerId
          clientId
          seller {
            id
            name
          }
          client {
            id
            razaoSocial
            nomeFantasia
          }
        }
      }
    }
  }
`;
