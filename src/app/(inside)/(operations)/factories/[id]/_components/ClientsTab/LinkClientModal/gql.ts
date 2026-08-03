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

// Vínculos já existentes desta fábrica: quem atende cada cliente hoje. O cliente
// ocupado continua na lista (o vendedor pode ter saído, deixado a fábrica...),
// marcado com o nome de quem atende — escolhê-lo é transferir o atendimento.
export const EXISTING_LINKS_QUERY = gql`
  query ExistingFactoryClientLinks($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          clientId
          sellerId
          seller {
            id
            name
          }
        }
      }
    }
  }
`;
