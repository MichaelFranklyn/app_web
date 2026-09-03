import { gql } from "@apollo/client";

export const FACTORY_SELLER_ACCESSES_QUERY = gql`
  query FactorySellerAccesses($input: BaseListInput!) {
    factory_seller_accesses: sellerFactoryAccessList(input: $input) {
      edges {
        node {
          id
          isActive
          createdAt
          sellerCommissionRate
          sellerCommissionBasis
          seller {
            id
            name
            isActive
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
