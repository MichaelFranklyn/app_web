import { gql } from "@apollo/client";

export const SELLERS_QUERY = gql`
  query Sellers($input: BaseListInput!) {
    sellers_list: sellers(input: $input) {
      edges {
        node {
          id
          name
          phone
          region
          homeCep
          homeStreet
          homeNumber
          homeComplement
          homeNeighborhood
          homeCity
          homeState
          isActive
          factoryCount
          clientCount
          totalRevenue
          lastOrderDate
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
