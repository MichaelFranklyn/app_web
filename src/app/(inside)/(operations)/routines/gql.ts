import { gql } from "@apollo/client";

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
