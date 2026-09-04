import { gql } from "@apollo/client";

/**
 * Marca a visita a partir do cliente e da data. A rotina da semana, o dia e a
 * fábrica principal são resolvidos no backend (ver `scheduleManualVisit`).
 */
export const SCHEDULE_MANUAL_VISIT_MUTATION = gql`
  mutation ScheduleManualVisit($input: ScheduleManualVisitInput!) {
    scheduleManualVisit(input: $input) {
      status
      message
      data {
        id
        scheduleDayId
        plannedOrder
        contactType
      }
    }
  }
`;

/**
 * Vínculos de UM cliente — de onde saem o vendedor e as fábricas que ele
 * atende. Só é buscada quando o modal abre já com o cliente definido (a tela do
 * cliente), para descobrir se há mais de um vendedor a desempatar.
 */
export const CLIENT_LINKS_FOR_VISIT_QUERY = gql`
  query ClientLinksForVisit($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          sellerId
          factoryId
          seller {
            id
            name
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

/** Clientes da carteira de um vendedor — as opções quando o cliente é escolhido aqui. */
export const WALLET_CLIENTS_FOR_VISIT_QUERY = gql`
  query WalletClientsForVisit($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          client {
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
