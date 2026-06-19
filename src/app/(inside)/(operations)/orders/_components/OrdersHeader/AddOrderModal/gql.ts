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
            razaoSocial
          }
        }
      }
    }
  }
`;

// Clientes designados ao vendedor + fábrica (seller_client_factories).
export const ORDER_SELLER_CLIENTS_QUERY = gql`
  query OrderSellerClients($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          clientId
          client {
            id
            razaoSocial
            nomeFantasia
          }
        }
      }
    }
  }
`;
