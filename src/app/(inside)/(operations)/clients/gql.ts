import { gql } from "@apollo/client";

export const CLIENT_STATS_QUERY = gql`
  query ClientStats($sellerId: UUID) {
    clientStats(sellerId: $sellerId) {
      totalClients
      activeClients
      atRiskClients
      noVisit30d
    }
  }
`;

// Vendedores para o filtro do gestor. Vendedor logado não usa (já vê só o seu).
export const CLIENTS_SELLERS_QUERY = gql`
  query ClientsSellers($input: BaseListInput!) {
    clients_sellers: sellers(input: $input) {
      edges {
        node {
          id
          name
        }
      }
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
          addressCity
          addressState
          isNeedsAttention
          attentionReason
          companyClient {
            id
            visitScoreTotal
            lastOrderDate
            lastInvoiceDate
            lastVisitDate
            sellers {
              id
              name
            }
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
