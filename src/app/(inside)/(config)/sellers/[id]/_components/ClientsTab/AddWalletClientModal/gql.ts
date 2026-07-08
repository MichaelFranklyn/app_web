import { gql } from "@apollo/client";

export const CREATE_SELLER_CLIENT_FACTORY_MUTATION = gql`
  mutation AddWalletClient($input: CreateSellerClientFactoryInput!) {
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

// Fábricas em que o vendedor tem acesso ativo (regra do vínculo de carteira).
export const SELLER_FACTORY_ACCESSES_QUERY = gql`
  query WalletSellerFactoryAccesses($input: BaseListInput!) {
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

// Clientes da carteira da empresa (o vínculo usa o id GLOBAL do cliente).
export const COMPANY_CLIENTS_QUERY = gql`
  query WalletCompanyClients($input: BaseListInput!) {
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

// factoryId (global) -> companyFactoryId, pois os níveis pendem do company_factory.
export const COMPANY_FACTORIES_QUERY = gql`
  query WalletCompanyFactories($input: BaseListInput!) {
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

export const PRICE_TIERS_QUERY = gql`
  query WalletPriceTiers($input: BaseListInput!) {
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

// Vínculos já existentes deste vendedor — para não oferecer um cliente que já
// está na carteira dele para a fábrica escolhida.
export const SELLER_CLIENT_FACTORIES_QUERY = gql`
  query WalletExistingLinks($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          sellerId
          factoryId
          clientId
        }
      }
    }
  }
`;

export interface SellerAccessesData {
  sellerFactoryAccessList: {
    edges: {
      node: {
        id: string;
        sellerId: string;
        factoryId: string;
        isActive: boolean;
        factory: {
          id: string;
          nomeFantasia: string | null;
          razaoSocial: string;
        } | null;
      };
    }[];
  };
}

export interface CompanyClientsData {
  companyClients: {
    edges: {
      node: {
        id: string;
        isActive: boolean;
        client: {
          id: string;
          razaoSocial: string;
          nomeFantasia: string | null;
        } | null;
      };
    }[];
  };
}

export interface CompanyFactoriesData {
  companyFactories: {
    edges: { node: { id: string; factoryId: string } }[];
  };
}

export interface PriceTiersData {
  priceTiers: {
    edges: { node: { id: string; name: string } }[];
  };
}

export interface ExistingLinksData {
  sellerClientFactoryList: {
    edges: {
      node: {
        id: string;
        sellerId: string;
        factoryId: string;
        clientId: string;
      };
    }[];
  };
}

export interface CreateSCFResponse {
  createSellerClientFactory: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  } | null;
}
