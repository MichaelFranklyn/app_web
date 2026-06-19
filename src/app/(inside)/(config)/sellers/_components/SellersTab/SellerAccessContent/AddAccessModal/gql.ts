import { gql } from "@apollo/client";

export const CREATE_SELLER_FACTORY_ACCESS_MUTATION = gql`
  mutation CreateSellerFactoryAccess($input: CreateSellerFactoryAccessInput!) {
    createSellerFactoryAccess(input: $input) {
      status
      message
    }
  }
`;

export const SELLERS_OPTIONS_QUERY = gql`
  query SellersOptions($input: BaseListInput!) {
    sellers_options: sellers(input: $input) {
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

export const COMPANY_FACTORIES_OPTIONS_QUERY = gql`
  query CompanyFactoriesOptions($input: BaseListInput!) {
    company_factories_options: companyFactories(input: $input) {
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

export const SELLER_ACCESSES_QUERY = gql`
  query SellerAccessesForModal($input: BaseListInput!) {
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
