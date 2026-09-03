import { gql } from "@apollo/client";

/** Clientes da empresa para escolher no registro — busca no servidor. */
export const SUPPORT_CLIENT_OPTIONS_QUERY = gql`
  query SupportClientOptions($input: BaseListInput!) {
    support_clients: companyClients(input: $input) {
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

/** Fábricas que atendem aquele cliente — as candidatas da reclamação. */
export const SUPPORT_CLIENT_FACTORIES_QUERY = gql`
  query SupportClientFactories($input: BaseListInput!) {
    support_client_factories: sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          factoryId
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

/**
 * Últimos pedidos do cliente, para amarrar a reclamação à nota.
 *
 * Sem paginação por busca: são os mais recentes, e é entre eles que está o
 * pedido de uma reclamação — ninguém liga hoje por uma caixa de dois anos atrás.
 */
export const SUPPORT_CLIENT_ORDERS_QUERY = gql`
  query SupportClientOrders($input: BaseListInput!) {
    support_client_orders: orders(input: $input) {
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
