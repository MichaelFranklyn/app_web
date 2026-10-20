import { gql } from "@apollo/client";

/**
 * A carteira disponível na semana, do mais urgente ao menos, e quem não pode
 * entrar (com o motivo). As fábricas em foco trazem as dimensões do score para
 * a tela dizer POR QUE o cliente está no topo, não só o número.
 */
export const PRIORITY_CLIENTS_QUERY = gql`
  query PriorityClients($weekStart: Date!, $sellerId: UUID) {
    priority_clients: priorityClients(
      weekStart: $weekStart
      sellerId: $sellerId
    ) {
      weekStart
      openDates
      workDates
      clients {
        clientId
        name
        neighborhood
        regionKey
        cityLabel
        latitude
        longitude
        score
        rank
        tier
        suggestedContactType
        isForced
        availableFrom
        focusLinks {
          id
          factory {
            id
            nomeFantasia
            razaoSocial
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
        scheduled {
          itemId
          date
          contactType
          status
        }
      }
      unavailable {
        clientId
        name
        cityLabel
        reason
        until
      }
    }
  }
`;
