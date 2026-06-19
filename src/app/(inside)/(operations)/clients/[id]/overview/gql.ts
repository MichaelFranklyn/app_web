import { gql } from "@apollo/client";

export const CLIENT_QUERY = gql`
  query ClientDetail($id: UUID!) {
    client(id: $id) {
      data {
        id
        cnpj
        razaoSocial
        nomeFantasia
        cnae
        cnaeDescription
        addressStreet
        addressNumber
        addressComplement
        addressNeighborhood
        addressZip
        addressCity
        addressState
        createdAt
        updatedAt
        companyClient {
          id
          notes
        }
      }
    }
  }
`;

export const SELLER_CLIENT_FACTORIES_QUERY = gql`
  query SellerClientFactories($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          factory {
            id
            name
          }
          seller {
            id
            name
          }
          priority
          visitFrequencyDays
          lastVisitDate
        }
      }
      pageInfo {
        hasNextPage
      }
      totalCount
    }
  }
`;
