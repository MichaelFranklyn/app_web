import { gql } from "@apollo/client";

// Clientes da carteira do vendedor — opções para agendar uma nova visita.
export const SELLER_CLIENT_LINKS_QUERY = gql`
  query SellerClientLinksForVisit($input: BaseListInput!) {
    seller_client_links: sellerClientFactoryList(input: $input) {
      edges {
        node {
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
`;

// Cria um dia de rotina vazio (usado ao agendar manualmente num dia de folga).
export const CREATE_VISIT_DAY_MUTATION = gql`
  mutation CreateVisitScheduleDay($input: CreateVisitScheduleDayInput!) {
    createVisitScheduleDay(input: $input) {
      status
      message
      data {
        id
      }
    }
  }
`;

// Adiciona manualmente uma visita a um dia da rotina.
export const CREATE_VISIT_ITEM_MUTATION = gql`
  mutation CreateVisitScheduleItem($input: CreateVisitScheduleItemInput!) {
    createVisitScheduleItem(input: $input) {
      status
      message
      data {
        id
      }
    }
  }
`;
