import { gql } from "@apollo/client";

// Mutation de criação usada pelo ImportOrderModal da aba.
export const CREATE_ORDER_FROM_FACTORY_MUTATION = gql`
  mutation CreateOrderFromFactory($input: CreateOrderInput!) {
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
      }
    }
  }
`;

export const FACTORY_ORDERS_QUERY = gql`
  query FactoryOrders($input: BaseListInput!) {
    factory_orders: orders(input: $input) {
      edges {
        node {
          id
          orderDate
          totalAmount
          commissionAmount
          status
          notes
          seller {
            id
            name
          }
          client {
            id
            razaoSocial
            nomeFantasia
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

/** Uma linha da tabela de pedidos da fábrica. */
export interface FactoryOrder {
  id: string;
  orderDate: string;
  totalAmount: string;
  commissionAmount: string;
  status: string;
  notes: string | null;
  seller: { id: string; name: string } | null;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
}

/**
 * Opções do filtro "Cliente" da aba.
 *
 * Busca no SERVIDOR: a carteira pode ter milhares de linhas, e um `first` fixo
 * devolveria um select que esconde cliente sem avisar. `useAsyncSelectOptions`
 * pede `totalCount` para decidir sozinho se filtra em memória (catálogo que
 * coube na 1ª página) ou volta ao servidor a cada termo.
 */
export const FACTORY_ORDER_CLIENTS_QUERY = gql`
  query FactoryOrderFilterClients($input: BaseListInput!) {
    factory_order_clients: clients(input: $input) {
      edges {
        node {
          id
          razaoSocial
          nomeFantasia
          cnpj
        }
      }
      totalCount
    }
  }
`;

/**
 * Opções do filtro "Vendedor": só quem tem acesso ATIVO a esta fábrica.
 *
 * Antes as opções saíam das próprias linhas baixadas — então um vendedor que
 * vendeu no ano passado sumia do filtro assim que seus pedidos saíam da
 * primeira página, e não havia como pedir a lista dele.
 */
export const FACTORY_ORDER_SELLERS_QUERY = gql`
  query FactoryOrderFilterSellers($input: BaseListInput!) {
    factory_order_sellers: sellerFactoryAccessList(input: $input) {
      edges {
        node {
          id
          isActive
          seller {
            id
            name
          }
        }
      }
      totalCount
    }
  }
`;

export interface FactoryOrderClientsData {
  factory_order_clients: {
    edges: {
      node: {
        id: string;
        razaoSocial: string;
        nomeFantasia: string | null;
        cnpj: string | null;
      };
    }[];
    totalCount: number;
  };
}

export interface FactoryOrderSellersData {
  factory_order_sellers: {
    edges: {
      node: {
        id: string;
        isActive: boolean;
        seller: { id: string; name: string } | null;
      };
    }[];
    totalCount: number;
  };
}
