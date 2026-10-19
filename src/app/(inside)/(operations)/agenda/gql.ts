import { gql } from "@apollo/client";

// Vendedores para o seletor do Montar semana: a rotina é de quem vende.
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

// As pessoas da empresa, para o "Agenda de" do gestor. `users` é @is_admin:
// o vendedor não escolhe — vê a própria agenda.
export const AGENDA_PEOPLE_QUERY = gql`
  query AgendaPeople($input: BaseListInput!) {
    agenda_people: users(input: $input) {
      edges {
        node {
          id
          name
          isActive
          seller {
            id
          }
        }
      }
    }
  }
`;

// Os campos do cliente que o card e a folha impressa leem. Fragmento porque o
// cliente vem por dois caminhos: o do vínculo e o da parada (a ligação do
// escritório não tem vínculo).
const AGENDA_CLIENT_FIELDS = gql`
  fragment AgendaClientFields on ClientType {
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
`;

export const VISIT_SCHEDULES_QUERY = gql`
  ${AGENDA_CLIENT_FIELDS}
  query VisitSchedules($input: BaseListInput!) {
    visit_schedules: visitSchedules(input: $input) {
      edges {
        node {
          id
          weekStart
          status
          generatedAt
          ownerUserId
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
              isManual
              tripId
              isFollowUp
              followUp {
                id
                reason
                status
              }
              client {
                ...AgendaClientFields
              }
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
                # Dono da visita: o "Novo pedido" do card abre já no vínculo.
                sellerId
                isNegative
                client {
                  ...AgendaClientFields
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

// Remarca a visita. Compartilhada pelo modal de remarcar e pelo arrastar entre
// dias da folhinha, por isso vive no nível da página.
export const RESCHEDULE_VISIT_MUTATION = gql`
  # input.targetDate (Date) remarca para uma data livre; o backend cria o dia/semana se faltar.
  mutation RescheduleVisit($input: RescheduleVisitInput!) {
    rescheduleVisit(input: $input) {
      status
      message
      data {
        originalItem {
          id
          status
        }
        newItem {
          id
        }
      }
    }
  }
`;
