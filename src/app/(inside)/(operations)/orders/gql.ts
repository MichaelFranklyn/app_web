import { gql } from "@apollo/client";

export const ORDER_STATS_QUERY = gql`
  query OrderStats {
    orderStats {
      totalOrders
      totalAmount
      avgTicket
    }
  }
`;

export const ORDERS_QUERY = gql`
  query Orders($input: BaseListInput!) {
    orders_list: orders(input: $input) {
      edges {
        node {
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
          factory {
            id
            nomeFantasia
            razaoSocial
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
