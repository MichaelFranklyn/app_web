import { gql } from "@apollo/client";

export const SELLER_FACTORY_ACCESS_LIST_QUERY = gql`
  query SellerFactoryAccessList($input: BaseListInput!) {
    seller_factory_access_list: sellerFactoryAccessList(input: $input) {
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
          factory {
            id
            nomeFantasia
            nickname
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
