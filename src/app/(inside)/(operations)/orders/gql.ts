import { gql } from "@apollo/client";

// Os mesmos filtros da lista: os números do topo têm de contar exatamente o que
// a tabela mostra. A paginação vai junto no input e é ignorada pelo backend.
export const ORDER_STATS_QUERY = gql`
  query OrderStats($input: BaseListInput) {
    orderStats(input: $input) {
      totalOrders
      totalAmount
      avgTicket
      invoicedOrders
      invoicedAmount
      commissionAmount
    }
  }
`;

// Opções dos filtros. Vendedores e fábricas são poucos por empresa: uma página
// só resolve. Clientes podem ser milhares — aquele select busca no servidor.
export const ORDER_FILTER_SELLERS_QUERY = gql`
  query OrderFilterSellers($input: BaseListInput!) {
    order_filter_sellers: sellers(input: $input) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const ORDER_FILTER_FACTORIES_QUERY = gql`
  query OrderFilterFactories($input: BaseListInput!) {
    order_filter_factories: companyFactories(input: $input) {
      edges {
        node {
          id
          factory {
            id
            nomeFantasia
            nickname
            razaoSocial
          }
        }
      }
    }
  }
`;

export const ORDER_FILTER_CLIENTS_QUERY = gql`
  query OrderFilterClients($input: BaseListInput!) {
    order_filter_clients: clients(input: $input) {
      edges {
        node {
          id
          razaoSocial
          nomeFantasia
          cnpj
        }
      }
    }
  }
`;

/**
 * Perfil de vendedor de quem está logado — só o id.
 *
 * Rede de segurança do vendedor: o dono do pedido normalmente sai do cookie
 * `userData`, mas sessão antiga (aberta antes de o cookie levar o `sellerId`)
 * chegaria aqui sem ele, e o `createOrder` recusaria um `sellerId` vazio. Esta
 * query é permitida a qualquer usuário com perfil — ao contrário de `sellers`,
 * que é admin-only.
 */
export const MY_SELLER_PROFILE_QUERY = gql`
  query MySellerProfileId {
    mySellerProfile {
      status
      data {
        id
      }
    }
  }
`;

export const ORDERS_QUERY = gql`
  query Orders($input: BaseListInput!) {
    orders_list: orders(input: $input) {
      edges {
        node {
          id
          orderDate
          invoicedAt
          totalAmount
          commissionAmount
          status
          isDeliveryOverdue
          seller {
            id
            name
          }
          client {
            id
            razaoSocial
            nomeFantasia
          }
          factory {
            id
            nomeFantasia
            nickname
            razaoSocial
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
