import { gql } from "@apollo/client";

export const SELLER_FACTORY_ACCESSES_QUERY = gql`
  query SellerFactoryAccesses($input: BaseListInput!) {
    seller_accesses: sellerFactoryAccessList(input: $input) {
      edges {
        node {
          id
          isActive
          createdAt
          factory {
            id
            nomeFantasia
            razaoSocial
          }
          grantedByUser {
            id
            name
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
