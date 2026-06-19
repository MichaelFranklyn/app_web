import { gql } from "@apollo/client";

export const CREATE_SELLER_CLIENT_FACTORY_MUTATION = gql`
  mutation CreateSellerClientFactory($input: CreateSellerClientFactoryInput!) {
    createSellerClientFactory(input: $input) {
      status
      code
      message
      data {
        id
      }
    }
  }
`;

export const SELLERS_FOR_LINK_QUERY = gql`
  query SellersForClientLink($input: BaseListInput!) {
    sellers(input: $input) {
      edges {
        node {
          id
          name
          isActive
        }
      }
    }
  }
`;

export const SELLER_FACTORY_ACCESSES_FOR_LINK_QUERY = gql`
  query SellerFactoryAccessesForClientLink($input: BaseListInput!) {
    sellerFactoryAccessList(input: $input) {
      edges {
        node {
          id
          sellerId
          factoryId
          isActive
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

export const SELLER_CLIENT_FACTORIES_FOR_LINK_QUERY = gql`
  query SellerClientFactoriesForLink($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          sellerId
          factoryId
        }
      }
    }
  }
`;

// A tabela de preço (e seus níveis) pende do company_factory, não da fábrica
// global; mapeamos factoryId -> companyFactoryId para então buscar os níveis.
export const COMPANY_FACTORIES_FOR_LINK_QUERY = gql`
  query CompanyFactoriesForLink($input: BaseListInput!) {
    companyFactories(input: $input) {
      edges {
        node {
          id
          factoryId
        }
      }
    }
  }
`;

export const PRICE_TIERS_FOR_LINK_QUERY = gql`
  query PriceTiersForLink($input: BaseListInput!) {
    priceTiers(input: $input) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;
