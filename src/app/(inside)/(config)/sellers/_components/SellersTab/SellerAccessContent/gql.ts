import { gql } from "@apollo/client";

export const SELLER_FACTORY_ACCESS_LIST_QUERY = gql`
  query SellerFactoryAccessList($input: BaseListInput!) {
    seller_factory_access_list: sellerFactoryAccessList(input: $input) {
      edges {
        node {
          id
          isActive
          createdAt
          seller {
            id
            name
            isActive
          }
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
