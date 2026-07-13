import { gql } from "@apollo/client";

export const USERS_QUERY = gql`
  query Users($input: BaseListInput!) {
    users_list: users(input: $input) {
      edges {
        node {
          id
          name
          email
          role
          isActive
          createdAt
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
