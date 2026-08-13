import { gql } from "@apollo/client";

export const PLATFORM_USER_QUERY = gql`
  query PlatformUser($id: UUID!) {
    platformUser(id: $id) {
      status
      code
      message
      data {
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
  }
`;

/** O que ESTA pessoa fez. Mesma query da tela de histórico, recortada por
 * `user_id` — o filtro já é aceito pelo backend. */
export const USER_ACTIVITY_QUERY = gql`
  query PlatformUserActivity($input: BaseListInput!) {
    user_activity: platformActivity(input: $input) {
      edges {
        node {
          id
          createdAt
          operation
          status
          errorMessage
          durationMs
        }
      }
      totalCount
    }
  }
`;
