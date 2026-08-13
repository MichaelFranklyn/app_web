import { gql } from "@apollo/client";

export const ISSUE_ACCESS_LINK_MUTATION = gql`
  mutation IssueTenantAccessLink($userId: UUID!) {
    issueTenantAccessLink(userId: $userId) {
      status
      code
      message
      data {
        link
        userEmail
        userName
      }
    }
  }
`;
