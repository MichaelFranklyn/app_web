import { gql } from "@apollo/client";

export const WEEK_SCHEDULE_QUERY = gql`
  query VisitsWeekSchedule($input: BaseListInput!) {
    week_schedule: visitSchedules(input: $input) {
      edges {
        node {
          id
          weekStart
          status
          seller {
            id
            user {
              name
            }
          }
          days {
            id
            date
            departureType
            departureAddress
            routeDistanceKm
            routeDurationMin
            status
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
                  addressStreet
                  addressNumber
                  addressNeighborhood
                  addressCity
                  addressState
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
