import { gql } from "@apollo/client";

export const PLATFORM_USERS_QUERY = gql`
  query PlatformUsersList($input: BaseListInput!) {
    platform_users: platformUsers(input: $input) {
      edges {
        node {
          id
          name
          email
          role
          isActive
          lastLoginAt
          createdAt
          companyId
          companyName
        }
      }
      totalCount
    }
  }
`;
