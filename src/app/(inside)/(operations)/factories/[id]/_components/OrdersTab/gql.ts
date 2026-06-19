import { gql } from "@apollo/client";

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
