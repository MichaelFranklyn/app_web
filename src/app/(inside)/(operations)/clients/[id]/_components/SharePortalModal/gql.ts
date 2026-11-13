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

/** Só o que o seletor do email precisa. Nome de operação próprio para não
 * colidir com o `ClientContacts` da ficha nos mocks do E2E. */
export const PORTAL_LINK_CONTACTS_QUERY = gql`
  query PortalLinkContacts($clientId: UUID!, $input: BaseListInput!) {
    clientContacts(clientId: $clientId, input: $input) {
      edges {
        node {
          id
          name
          email
          isPrimary
          isActive
        }
      }
      totalCount
    }
  }
`;

export const SEND_CLIENT_PORTAL_LINK_EMAIL_MUTATION = gql`
  mutation SendClientPortalLinkEmail(
    $companyClientId: UUID!
    $input: SendClientPortalLinkEmailInput!
  ) {
    sendClientPortalLinkEmail(
      companyClientId: $companyClientId
      input: $input
    ) {
      status
      message
    }
  }
`;
