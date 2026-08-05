import { gql } from "@apollo/client";

/** As linhas: a carteira, com o que já se sabe de cada cliente. */
export const CLIENTS_REPORT_QUERY = gql`
  query ClientsReport($input: BaseListInput!) {
    clients_report: clients(input: $input) {
      edges {
        node {
          id
          cnpj
          razaoSocial
          nomeFantasia
          addressCity
          addressState
          isNeedsAttention
          companyClient {
            id
            visitScoreTotal
            lastOrderDate
            lastVisitDate
            network {
              id
              name
            }
            segment {
              id
              name
            }
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

/**
 * Fechamento da CARTEIRA — um retrato de hoje, não do período: quantos clientes
 * existem, quantos estão ativos, quantos estão atrasados para voltar e quantos
 * não recebem visita há 30 dias.
 */
export const CLIENTS_REPORT_STATS_QUERY = gql`
  query ClientsReportStats($sellerId: UUID) {
    clients_report_stats: clientStats(sellerId: $sellerId) {
      totalClients
      activeClients
      atRiskClients
      noVisit30d
    }
  }
`;

/**
 * Quem está mais atrasado para voltar a comprar, comparado ao próprio ritmo.
 * Respeita o período do relatório (é dele que sai o intervalo médio de cada um).
 */
export const CLIENTS_AT_RISK_QUERY = gql`
  query ClientsReportAtRisk(
    $from: Date
    $to: Date
    $sellerId: UUID
    $limit: Int
  ) {
    clientsAtRisk(from: $from, to: $to, sellerId: $sellerId, limit: $limit) {
      entityId
      entityName
      lastOrderDate
      daysSinceLastOrder
      avgIntervalDays
      riskRatio
      orderCount
    }
  }
`;
