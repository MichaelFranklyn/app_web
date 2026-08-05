import { gql } from "@apollo/client";

/**
 * A matriz de positivação inteira, sem paginação.
 *
 * O relatório é um documento de conferência: cortar em top-N esconderia
 * exatamente as linhas que ele existe para mostrar — os clientes que não
 * compraram. As células vêm na mesma ordem de `factories` (as colunas).
 */
export const POSITIVATION_REPORT_QUERY = gql`
  query PositivationReport($from: Date, $to: Date, $sellerId: UUID) {
    positivationReport(from: $from, to: $to, sellerId: $sellerId) {
      walletClients
      positivatedClients
      clientPositivationRate
      linkedPairs
      positivatedPairs
      pairPositivationRate
      totalAmount
      factories {
        factoryId
        factoryName
        linkedClients
        positivatedClients
        positivationRate
        totalAmount
      }
      rows {
        clientId
        companyClientId
        clientName
        sellerId
        sellerName
        linkedFactories
        positivatedFactories
        orderCount
        totalAmount
        lastOrderDate
        cells {
          factoryId
          factoryName
          isLinked
          isPositivated
          orderCount
          totalAmount
          lastOrderDate
        }
      }
    }
  }
`;
