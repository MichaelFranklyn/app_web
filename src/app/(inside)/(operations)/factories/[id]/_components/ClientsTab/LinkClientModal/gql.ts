import { gql } from "@apollo/client";

export const CREATE_SELLER_CLIENT_FACTORY_MUTATION = gql`
  mutation LinkClientToFactory($input: CreateSellerClientFactoryInput!) {
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

// Clientes da carteira da empresa (precisa estar na carteira para vincular).
export const COMPANY_CLIENTS_FOR_LINK_QUERY = gql`
  query CompanyClientsForFactoryLink($input: BaseListInput!) {
    companyClients(input: $input) {
      edges {
        node {
          id
          isActive
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

// Vendedores com acesso ativo a esta fábrica (regra do vínculo).
export const SELLERS_WITH_ACCESS_QUERY = gql`
  query SellersWithAccessForFactory($input: BaseListInput!) {
    sellerFactoryAccessList(input: $input) {
      edges {
        node {
          id
          sellerId
          isActive
          seller {
            id
            name
          }
        }
      }
    }
  }
`;

// Níveis de preço desta fábrica (company_factory).
export const PRICE_TIERS_FOR_LINK_QUERY = gql`
  query PriceTiersForFactoryLink($input: BaseListInput!) {
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

// Vínculos já existentes desta fábrica (para não repetir o cliente).
export const EXISTING_LINKS_QUERY = gql`
  query ExistingFactoryClientLinks($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          clientId
        }
      }
    }
  }
`;
