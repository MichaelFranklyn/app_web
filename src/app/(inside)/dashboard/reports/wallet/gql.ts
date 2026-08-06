import { gql } from "@apollo/client";

/**
 * A carteira inteira com a situação de cada cliente.
 *
 * Vem sem corte: um relatório de situação existe para mostrar quem sumiu, e
 * quem sumiu é exatamente quem cairia fora de um top-N. A paginação é local.
 */
export const WALLET_STATUS_REPORT_QUERY = gql`
  query WalletStatusReport($from: Date, $to: Date, $sellerId: UUID) {
    walletStatusReport(from: $from, to: $to, sellerId: $sellerId) {
      rows {
        clientId
        companyClientId
        clientName
        city
        state
        situation
        lastOrderDate
        daysSinceLastOrder
        avgIntervalDays
        riskRatio
        orderCount
        periodOrderCount
        periodAmount
      }
      totalClients
      activeClients
      atRiskClients
      inactiveClients
      neverBoughtClients
      newClients
      periodAmount
    }
  }
`;
