import { gql } from "@apollo/client";

export const CLIENT_PORTAL_LINK_QUERY = gql`
  query ClientPortalLink($companyClientId: UUID!) {
    clientPortalLink(companyClientId: $companyClientId) {
      status
      data {
        url
        expiresAt
        lastAccessedAt
        createdAt
      }
    }
  }
`;

export const ISSUE_CLIENT_PORTAL_LINK_MUTATION = gql`
  mutation IssueClientPortalLink($companyClientId: UUID!) {
    issueClientPortalLink(companyClientId: $companyClientId) {
      status
      message
      data {
        url
        expiresAt
        lastAccessedAt
        createdAt
      }
    }
  }
`;

export const REVOKE_CLIENT_PORTAL_LINK_MUTATION = gql`
  mutation RevokeClientPortalLink($companyClientId: UUID!) {
    revokeClientPortalLink(companyClientId: $companyClientId) {
      status
      message
    }
  }
`;
