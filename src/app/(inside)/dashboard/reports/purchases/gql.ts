import { gql } from "@apollo/client";

/**
 * A última compra de cada cliente em cada fábrica, o relatório inteiro.
 *
 * Vem sem corte de top-N e sem paginação de servidor: o assunto do papel é quem
 * está deixando de comprar de uma fábrica, e quem está deixando de comprar é
 * exatamente quem cairia fora de um resumo. Filtro, ordenação e paginação são
 * locais — o conjunto já está na mão.
 */
export const CLIENT_FACTORY_PURCHASES_QUERY = gql`
  query ClientFactoryPurchasesReport($from: Date, $to: Date, $sellerId: UUID) {
    clientFactoryPurchasesReport(from: $from, to: $to, sellerId: $sellerId) {
      rows {
        clientId
        companyClientId
        clientName
        city
        state
        factoryId
        factoryName
        sellerName
        isLinked
        situation
        lastOrderId
        lastOrderDate
        lastOrderAmount
        lastOrderStatus
        lastInvoicedAt
        daysSinceLastOrder
        avgIntervalDays
        riskRatio
        orderCount
        historyAmount
        periodOrderCount
        periodAmount
      }
      totalRows
      clientCount
      factoryCount
      neverBoughtRows
      atRiskRows
      inactiveRows
      periodOrderCount
      periodAmount
    }
  }
`;
