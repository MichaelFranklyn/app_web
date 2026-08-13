import { gql } from "@apollo/client";

export const PLATFORM_TENANTS_QUERY = gql`
  query PlatformTenants($input: BaseListInput!) {
    platform_tenants: platformTenants(input: $input) {
      edges {
        node {
          id
          cnpj
          razaoSocial
          nomeFantasia
          segment
          plan
          logoUrl
          isActive
          suspendedAt
          suspensionReason
          trialEndsAt
          createdAt
          usersCount
          sellersCount
          clientsCount
          factoriesCount
          ordersCount
          ordersInPeriod
          gmvInPeriod
          lastLoginAt
          lastOrderDate
        }
      }
      totalCount
    }
  }
`;
