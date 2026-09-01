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

// Gera a rotina da semana inteira (usada quando a semana ainda não tem rotina).
// O backend resolve o seller_id para o vendedor logado; gestores mandam sellerId.
export const GENERATE_WEEKLY_SCHEDULE_MUTATION = gql`
  mutation GenerateWeeklySchedule($input: GenerateWeeklyScheduleInput!) {
    generateWeeklySchedule(input: $input) {
      status
      message
      data {
        id
      }
    }
  }
`;

// Config da agenda do vendedor — usada para saber o limite de visitas por dia.
export const VISIT_SCHEDULE_CONFIG_QUERY = gql`
  query VisitScheduleConfig($input: BaseListInput!) {
    visit_schedule_configs: visitScheduleConfigs(input: $input) {
      edges {
        node {
          id
          sellerId
          maxVisitsPerDay
          maxRemoteContactsPerDay
          isRemoteContactEnabled
        }
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
              fixedScheduleId
              plannedOrder
              contactType
              estimatedTravelMin
              plannedStartTime
              plannedEndTime
              visitDurationMin
              status
              outcome
              notes
              isWholeDay
              focusFactories {
                scoreTotal
                factory {
                  id
                  nomeFantasia
                  nickname
                  razaoSocial
                }
                clientFactoryLink {
                  id
                  latestVisitScore {
                    scoreTotal
                    scoreUrgency
                    scorePriority
                    scoreFrequency
                    scorePotential
                    scoreRecency
                    stockConfidence
                  }
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
                  scoreUrgency
                  scorePriority
                  scoreFrequency
                  scorePotential
                  scoreRecency
                  stockConfidence
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

// Atualiza status/notas de um item de visita. Compartilhada pelo card da grade
// semanal (atalho de concluir/reabrir) e pelo EditVisitModal, por isso vive no
// nível da página.
export const UPDATE_VISIT_ITEM_MUTATION = gql`
  mutation UpdateVisitScheduleItem(
    $id: UUID!
    $input: UpdateVisitScheduleItemInput!
  ) {
    updateVisitScheduleItem(id: $id, input: $input) {
      status
      message
      data {
        id
        status
        outcome
        notes
        nextVisitSuggestion
      }
    }
  }
`;

// Dias que o vendedor marcou como não trabalhados na semana em tela. Consulta
// própria (e não um campo da rotina) porque a folga existe mesmo quando a
// semana ainda não foi planejada — é o caso de marcá-la com antecedência.
export const SELLER_DAY_OFFS_QUERY = gql`
  query SellerDayOffs($sellerId: UUID, $from: Date!, $to: Date!) {
    seller_day_offs: sellerDayOffs(sellerId: $sellerId, from: $from, to: $to) {
      id
      date
      reason
    }
  }
`;

// Marca o dia e realoca o que já estava planejado nele. A mensagem do backend
// diz quantas paradas foram remarcadas e quantas ficaram sem vaga — é ela que
// vai ao toast, não um texto fixo daqui.
export const MARK_SELLER_DAY_OFF_MUTATION = gql`
  mutation MarkSellerDayOff($sellerId: UUID, $date: Date!, $reason: String) {
    markSellerDayOff(sellerId: $sellerId, date: $date, reason: $reason) {
      status
      message
      data {
        rescheduled
        released
        dayOff {
          id
          date
          reason
        }
      }
    }
  }
`;

export const UNMARK_SELLER_DAY_OFF_MUTATION = gql`
  mutation UnmarkSellerDayOff($sellerId: UUID, $date: Date!) {
    unmarkSellerDayOff(sellerId: $sellerId, date: $date) {
      status
      message
      data {
        id
        date
      }
    }
  }
`;
