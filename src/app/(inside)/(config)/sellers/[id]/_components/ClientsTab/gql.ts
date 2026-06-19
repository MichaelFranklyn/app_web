import { gql } from "@apollo/client";

export const SELLER_CLIENTS_QUERY = gql`
  query SellerClientLinks($input: BaseListInput!) {
    seller_clients: sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          priority
          visitFrequencyDays
          lastVisitDate
          createdAt
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
