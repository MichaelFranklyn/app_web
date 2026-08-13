import { gql } from "@apollo/client";

export const PLATFORM_AUDIT_QUERY = gql`
  query PlatformAuditList($input: BaseListInput!) {
    platform_audit: platformAuditLogs(input: $input) {
      edges {
        node {
          id
          createdAt
          action
          actorEmail
          targetCompanyId
          targetLabel
          reason
          ipAddress
        }
      }
      totalCount
    }
  }
`;
