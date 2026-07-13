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
          companyClient {
            id
            visitScoreTotal
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
