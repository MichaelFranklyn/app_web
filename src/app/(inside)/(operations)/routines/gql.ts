import { gql } from "@apollo/client";

// Gera a rota de um único dia (usada na grade semanal e na tela do dia). O
// backend resolve o seller_id para o vendedor logado; gestores mandam sellerId.
export const GENERATE_DAY_ROUTE_MUTATION = gql`
  mutation GenerateDayRoute($input: GenerateDayRouteInput!) {
    generateDayRoute(input: $input) {
      status
      message
      data {
        id
      }
    }
  }
`;

// Lista de vendedores para o seletor de rotina (owner/admin escolhe de quem ver).
export const ROUTINE_SELLERS_QUERY = gql`
  query RoutineSellersOptions($input: BaseListInput!) {
    routine_sellers: sellers(input: $input) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const VISIT_SCHEDULES_QUERY = gql`
  query VisitSchedules($input: BaseListInput!) {
    visit_schedules: visitSchedules(input: $input) {
      edges {
        node {
          id
          weekStart
          status
          generatedAt
          seller {
            id
            user {
              name
            }
          }
          days {
            id
            date
            status
            departureType
            routeDistanceKm
            routeDurationMin
            items {
              id
              plannedOrder
              estimatedTravelMin
              status
              outcome
              stockObservation
              notes
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
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;
