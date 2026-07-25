import { gql } from "@apollo/client";

export const CREATE_SELLER_FACTORY_ACCESS_MUTATION = gql`
  mutation CreateSellerFactoryAccessForSeller(
    $input: CreateSellerFactoryAccessInput!
  ) {
    createSellerFactoryAccess(input: $input) {
      status
      message
    }
  }
`;

// Fábricas da empresa (o acesso do vendedor só pode apontar para uma fábrica
// que a empresa já possui). `factoryId` é o id global usado na mutation.
export const COMPANY_FACTORIES_OPTIONS_QUERY = gql`
  query SellerLinkCompanyFactories($input: BaseListInput!) {
    company_factories_options: companyFactories(input: $input) {
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

// Acessos já existentes do vendedor — para não oferecer fábricas repetidas.
export const SELLER_ACCESSES_QUERY = gql`
  query SellerLinkExistingAccesses($input: BaseListInput!) {
    seller_accesses: sellerFactoryAccessList(input: $input) {
      edges {
        node {
          sellerId
          factoryId
          isActive
        }
      }
    }
  }
`;

export interface CompanyFactoriesOptionsData {
  company_factories_options: {
    edges: {
      node: {
        factoryId: string;
        factory: {
          id: string;
          nomeFantasia: string | null;
          razaoSocial: string;
        } | null;
      };
    }[];
  };
}

export interface SellerAccessesData {
  seller_accesses: {
    edges: {
      node: { sellerId: string; factoryId: string; isActive: boolean };
    }[];
  };
}

export interface CreateAccessResponse {
  createSellerFactoryAccess: {
    status: boolean;
    message: string;
  } | null;
}
