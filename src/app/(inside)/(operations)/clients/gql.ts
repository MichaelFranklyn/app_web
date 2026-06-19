import { gql } from "@apollo/client";

export const CLIENT_STATS_QUERY = gql`
  query ClientStats {
    clientStats {
      totalClients
      activeClients
      atRiskClients
      noVisit30d
    }
  }
`;

export const CLIENTS_QUERY = gql`
  query Clients($input: BaseListInput!) {
    clients_list: clients(input: $input) {
      edges {
        node {
          id
          cnpj
          razaoSocial
          nomeFantasia
          cnae
          cnaeDescription
          addressCity
          addressState
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

export const ADD_CLIENT_TO_COMPANY_MUTATION = gql`
  mutation AddClientToCompany($input: AddClientToCompanyInput!) {
    addClientToCompany(input: $input) {
      status
      code
      message
      data {
        id
        clientId
      }
    }
  }
`;
