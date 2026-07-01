import { gql } from "@apollo/client";

// Lista de vendedores para o seletor do gestor (owner/admin/su) no dashboard.
export const DASHBOARD_SELLERS_QUERY = gql`
  query DashboardSellers($input: BaseListInput!) {
    dashboard_sellers: sellers(input: $input) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const ORDERS_BY_PERIOD_QUERY = gql`
  query OrdersByPeriod($input: BaseListInput!) {
    orders_by_period: orders(input: $input) {
      edges {
        node {
          id
          orderDate
          totalAmount
          status
          client {
            id
            razaoSocial
            nomeFantasia
          }
          factory {
            id
            razaoSocial
            nomeFantasia
          }
        }
      }
      totalCount
    }
  }
`;

export const COMPANY_CLIENTS_COUNT_QUERY = gql`
  query CompanyClientsCount($input: BaseListInput!) {
    company_clients_count: companyClients(input: $input) {
      totalCount
    }
  }
`;

export const SCHEDULES_BY_PERIOD_QUERY = gql`
  query SchedulesByPeriod($input: BaseListInput!) {
    schedules_by_period: visitSchedules(input: $input) {
      edges {
        node {
          id
          weekStart
          status
          days {
            id
            date
            items {
              id
              plannedOrder
              status
              clientFactoryLink {
                id
                client {
                  id
                  razaoSocial
                  nomeFantasia
                }
                factory {
                  id
                  razaoSocial
                  nomeFantasia
                }
              }
            }
          }
        }
      }
    }
  }
`;
