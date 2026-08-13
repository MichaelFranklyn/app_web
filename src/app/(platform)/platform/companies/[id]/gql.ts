import { gql } from "@apollo/client";

export const PLATFORM_TENANT_QUERY = gql`
  query PlatformTenant($id: UUID!) {
    platformTenant(id: $id) {
      status
      code
      message
      data {
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
        maxUsers
        maxSellers
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
  }
`;

export const TENANT_USERS_QUERY = gql`
  query PlatformTenantUsers($input: BaseListInput!) {
    tenant_users: platformUsers(input: $input) {
      edges {
        node {
          id
          name
          email
          role
          isActive
          lastLoginAt
          companyId
          companyName
        }
      }
      totalCount
    }
  }
`;

export const TENANT_AUDIT_QUERY = gql`
  query PlatformTenantAudit($input: BaseListInput!) {
    tenant_audit: platformAuditLogs(input: $input) {
      edges {
        node {
          id
          createdAt
          action
          actorEmail
          targetLabel
          reason
          payload
        }
      }
      totalCount
    }
  }
`;

/**
 * O que a EMPRESA fez — o outro lado da trilha de auditoria, que registra o
 * que a plataforma fez sobre ela. As duas convivem na ficha de propósito: uma
 * suspensão só se explica ao lado do uso que a antecedeu.
 */
export const TENANT_ACTIVITY_QUERY = gql`
  query PlatformTenantActivity($input: BaseListInput!) {
    tenant_activity: platformActivity(input: $input) {
      edges {
        node {
          id
          createdAt
          operation
          status
          errorMessage
          userEmail
          userRole
        }
      }
      totalCount
    }
  }
`;

/** Curva de uso da empresa. É a MESMA query da tela de histórico, com
 * `companyId` preenchido — o backend já aceita o recorte. */
export const TENANT_ACTIVITY_SUMMARY_QUERY = gql`
  query PlatformTenantActivitySummary($companyId: UUID) {
    platformActivitySummary(companyId: $companyId) {
      status
      data {
        totalActions
        totalErrors
        byOperation {
          key
          total
          errors
        }
        byDay {
          key
          total
          errors
        }
      }
    }
  }
`;

export const SET_TENANT_STATUS_MUTATION = gql`
  mutation SetTenantStatus($companyId: UUID!, $input: SetTenantStatusInput!) {
    setTenantStatus(companyId: $companyId, input: $input) {
      status
      code
      message
      data {
        id
        isActive
        suspendedAt
        suspensionReason
      }
    }
  }
`;

export const UPDATE_TENANT_PLAN_MUTATION = gql`
  mutation UpdateTenantPlan($companyId: UUID!, $input: UpdateTenantPlanInput!) {
    updateTenantPlan(companyId: $companyId, input: $input) {
      status
      code
      message
      data {
        id
        plan
        trialEndsAt
        maxUsers
        maxSellers
      }
    }
  }
`;

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

export const IMPERSONATE_USER_MUTATION = gql`
  mutation ImpersonateUser($userId: UUID!, $reason: String) {
    impersonateUser(userId: $userId, reason: $reason) {
      status
      code
      message
      data {
        accessToken
        userId
        userName
        userEmail
        companyName
        role
        sellerId
        expiresInMinutes
      }
    }
  }
`;
