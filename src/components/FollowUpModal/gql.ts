import { gql } from "@apollo/client";

/** Clientes da empresa para escolher no agendamento — busca no servidor. */
export const FOLLOW_UP_CLIENT_OPTIONS_QUERY = gql`
  query FollowUpClientOptions($input: BaseListInput!) {
    follow_up_clients: companyClients(input: $input) {
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
 * Os pedidos mais recentes do cliente, para amarrar o contato ao orçamento ou
 * pedido de que ele trata. Os mais novos bastam: ninguém agenda retorno sobre o
 * pedido de dois anos atrás.
 */
export const FOLLOW_UP_CLIENT_ORDERS_QUERY = gql`
  query FollowUpClientOrders($input: BaseListInput!) {
    follow_up_orders: orders(input: $input) {
      edges {
        node {
          id
          orderDate
          invoiceNumber
          status
          factory {
            id
            razaoSocial
            nomeFantasia
            nickname
          }
        }
      }
      totalCount
    }
  }
`;
