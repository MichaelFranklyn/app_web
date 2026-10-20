import { gql } from "@apollo/client";

/**
 * Marca a parada a partir do cliente, do dia e do tipo. A agenda da semana, o
 * dia e a fábrica principal são resolvidos no backend (ver
 * `scheduleManualVisit`); o combinado (motivo, pedido, retorno) vai junto.
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
 * atende. Buscada quando o cliente já está escolhido, para oferecer a fábrica
 * principal e saber quem atende o cliente.
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

/**
 * Clientes da EMPRESA, com busca no servidor — para a agenda de quem não vende
 * (o escritório liga para qualquer cliente, sobre boleto e entrega).
 */
export const COMPANY_CLIENTS_FOR_VISIT_QUERY = gql`
  query CompanyClientsForVisit($input: BaseListInput!) {
    schedule_clients: companyClients(input: $input) {
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

/**
 * As pessoas da empresa, para o "Agenda de quem" do gestor. `users` é
 * @is_admin: o vendedor nem pergunta — marca sempre na própria agenda.
 */
export const SCHEDULE_PEOPLE_QUERY = gql`
  query SchedulePeople($input: BaseListInput!) {
    schedule_people: users(input: $input) {
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

/**
 * Os pedidos mais recentes do cliente, para amarrar a parada ao orçamento ou
 * pedido de que ela trata. Os mais novos bastam: ninguém marca retorno sobre o
 * pedido de dois anos atrás.
 */
export const CLIENT_ORDERS_FOR_VISIT_QUERY = gql`
  query ClientOrdersForVisit($input: BaseListInput!) {
    schedule_orders: orders(input: $input) {
      edges {
        node {
          id
          orderDate
          invoiceNumber
          factory {
            id
            razaoSocial
            nomeFantasia
            nickname
          }
        }
      }
    }
  }
`;
