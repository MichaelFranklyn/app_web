import { gql } from "@apollo/client";

export const CREATE_SELLER_FACTORY_ACCESS_MUTATION = gql`
  mutation CreateSellerFactoryAccessForFactory(
    $input: CreateSellerFactoryAccessInput!
  ) {
    createSellerFactoryAccess(input: $input) {
      status
      message
      data {
        id
        isActive
        createdAt
        seller {
          id
          name
          region
          clientCount
          factoryCount
          totalRevenue
        }
        grantedByUser {
          id
          name
        }
      }
    }
  }
`;

export const FACTORY_SELLERS_OPTIONS_QUERY = gql`
  query FactorySellersOptions($input: BaseListInput!) {
    factory_sellers_options: sellers(input: $input) {
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

export const FACTORY_LINKED_ACCESSES_QUERY = gql`
  query FactoryLinkedAccesses($input: BaseListInput!) {
    factory_linked_accesses: sellerFactoryAccessList(input: $input) {
      edges {
        node {
          sellerId
        }
      }
    }
  }
`;
