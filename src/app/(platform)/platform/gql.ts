import { gql } from "@apollo/client";

export const PLATFORM_OVERVIEW_QUERY = gql`
  query PlatformOverview($period: PlatformPeriodInput) {
    platformOverview(period: $period) {
      status
      code
      message
      data {
        totalCompanies
        activeCompanies
        suspendedCompanies
        trialCompanies
        newCompaniesInPeriod
        totalUsers
        activeUsersInPeriod
        neverLoggedUsers
        engagedCompanies
        totalSellers
        totalClients
        totalFactoryLinks
        totalOrders
        ordersInPeriod
        gmvInPeriod
      }
    }
  }
`;

export const PLATFORM_ATTENTION_QUERY = gql`
  query PlatformAttention {
    platformAttention {
      status
      code
      message
      data {
        kind
        severity
        companyId
        companyName
        detail
      }
    }
  }
`;

export const PLATFORM_OPERATION_QUERY = gql`
  query PlatformOperation($period: PlatformPeriodInput) {
    platformOperation(period: $period) {
      status
      code
      message
      data {
        activeClients
        positivatedClients
        visitsPlanned
        visitsDone
        averageTicket
        activeSellers
        ordersPerSeller
      }
    }
  }
`;

export const PLATFORM_TENANT_HEALTH_QUERY = gql`
  query PlatformTenantHealth($period: PlatformPeriodInput) {
    platformTenantHealth(period: $period) {
      status
      code
      message
      data {
        companyId
        companyName
        isActive
        ordersCurrent
        ordersPrevious
        gmvCurrent
        gmvPrevious
        changePercent
        trend
        lastOrderDate
      }
    }
  }
`;

export const PLATFORM_ADOPTION_QUERY = gql`
  query PlatformFeatureAdoption($period: PlatformPeriodInput) {
    platformFeatureAdoption(period: $period) {
      status
      code
      message
      data {
        feature
        label
        tenantsUsing
        totalTenants
      }
    }
  }
`;

/** Permanência por turma de entrada — o contraponto do gráfico de crescimento,
 * que só sabe contar quem chegou. */
export const PLATFORM_RETENTION_QUERY = gql`
  query PlatformRetention($months: Int) {
    platformRetention(months: $months) {
      status
      code
      message
      data {
        currentMonth
        months
        overall
        cohorts {
          cohort
          companies
          values
        }
      }
    }
  }
`;

/** Uso medido em PESSOAS. O pulso de `platformActivitySummary` conta ações, e
 * as duas leituras discordam com frequência — trezentas ações de uma pessoa só
 * parecem um dia movimentado até se olhar por aqui. */
export const PLATFORM_ENGAGEMENT_QUERY = gql`
  query PlatformEngagement($period: PlatformPeriodInput) {
    platformEngagement(period: $period) {
      status
      code
      message
      data {
        dailyAverage
        weeklyActive
        monthlyActive
        activeCompanies
        stickiness
        peakUsers
        peakDay
        daily {
          day
          users
          companies
          actions
        }
      }
    }
  }
`;

export const PLATFORM_GROWTH_QUERY = gql`
  query PlatformGrowth($months: Int) {
    platformGrowth(months: $months) {
      status
      code
      message
      data {
        month
        newCompanies
        newUsers
        orders
        gmv
      }
    }
  }
`;

/**
 * O catálogo de planos. Sem variáveis e sem banco do outro lado — é constante
 * de código no backend —, então o cache do Apollo responde a todas as telas que
 * o pedirem depois da primeira.
 */
export const PLAN_CATALOG_QUERY = gql`
  query PlanCatalog {
    planCatalog {
      status
      code
      message
      data {
        code
        label
        features
        limits {
          key
          label
          limit
        }
      }
    }
  }
`;
