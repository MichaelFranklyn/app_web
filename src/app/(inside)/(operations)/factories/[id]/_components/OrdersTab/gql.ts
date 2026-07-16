import { gql } from "@apollo/client";

// Compartilhados entre AddOrderModal (criação manual) e ImportOrderModal
// (criação + importação de arquivo) — por isso vivem no pai OrdersTab.
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

export const FACTORY_ORDERS_QUERY = gql`
  query FactoryOrders($input: BaseListInput!) {
    factory_orders: orders(input: $input) {
      edges {
        node {
          id
          orderDate
          totalAmount
          commissionAmount
          status
          notes
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
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;
