import { gql } from "@apollo/client";

// Altera o ponto de partida do dia (casa do vendedor ou endereço personalizado).
// O backend recalcula a rota inteira (ordem + distância) a partir da nova origem,
// então a tela faz refetch da WEEK_SCHEDULE_QUERY após o sucesso.
export const UPDATE_DAY_DEPARTURE_MUTATION = gql`
  mutation UpdateDayDeparture(
    $id: UUID!
    $input: UpdateVisitScheduleDayInput!
  ) {
    updateVisitScheduleDay(id: $id, input: $input) {
      status
      message
      data {
        id
        departureType
        departureAddress
      }
    }
  }
`;

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
              contactType
              estimatedTravelMin
              plannedStartTime
              plannedEndTime
              visitDurationMin
              status
              outcome
              notes
              focusFactories {
                scoreTotal
                factory {
                  id
                  nomeFantasia
                  nickname
                  razaoSocial
                }
              }
              treatedFactories {
                id
                nomeFantasia
                razaoSocial
              }
              clientFactoryLink {
                id
                client {
                  id
                  razaoSocial
                  nomeFantasia
                  companyClient {
                    id
                  }
                  addressStreet
                  addressNumber
                  addressNeighborhood
                  addressCity
                  addressState
                  primaryContact {
                    id
                    name
                    phone
                  }
                }
                factory {
                  id
                  razaoSocial
                  nomeFantasia
                  nickname
                }
                latestVisitScore {
                  scoreTotal
                }
              }
            }
          }
        }
      }
    }
  }
`;
