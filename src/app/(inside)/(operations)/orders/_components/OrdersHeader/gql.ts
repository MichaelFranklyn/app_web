import { gql } from "@apollo/client";

export const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      status
      code
      message
      data {
        id
        orderDate
        invoicedAt
        totalAmount
        commissionAmount
        status
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
  }
`;

export const ORDER_SELLERS_OPTIONS_QUERY = gql`
  query OrderSellersOptions($input: BaseListInput!) {
    order_sellers_options: sellers(input: $input) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

// Fábricas que o vendedor selecionado pode atender (seller_factory_access).
export const ORDER_SELLER_FACTORIES_QUERY = gql`
  query OrderSellerFactories($input: BaseListInput!) {
    sellerFactoryAccessList(input: $input) {
      edges {
        node {
          factoryId
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

/**
 * Clientes designados ao vendedor + fábrica (seller_client_factories).
 *
 * Buscada no SERVIDOR (ver `useAsyncSelectOptions`): a carteira de um vendedor
 * numa fábrica passa de uma página em representação grande, e a página fixa
 * truncava a lista sem avisar — o cliente que faltava não tinha como ser
 * encontrado. `totalCount` é o que deixa o hook voltar ao filtro em memória
 * quando a carteira cabe inteira na primeira página.
 */
export const ORDER_SELLER_CLIENTS_QUERY = gql`
  query OrderSellerClients($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      totalCount
      edges {
        node {
          clientId
          client {
            id
            razaoSocial
            nomeFantasia
            cnpj
          }
          # Sugere "dura quantos dias na loja?" já preenchido — o campo estava
          # vazio em 100% dos pedidos, e é dele que sai a única medida de
          # DURAÇÃO que o motor de rotina tem.
          cadence {
            days
            source
          }
        }
      }
    }
  }
`;
