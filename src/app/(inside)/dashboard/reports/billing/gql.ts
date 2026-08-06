import { gql } from "@apollo/client";

/**
 * As duplicatas que VENCEM no período, com o fechamento delas.
 *
 * Vem inteiro numa consulta só (sem paginação de servidor) porque a agenda de
 * cobrança se lê por inteiro: esconder metade das parcelas de um mês num
 * documento de conferência é esconder justamente o boleto que se foi procurar.
 * A paginação da tela é local (ver `useLocalReportPage`).
 */
export const BILLING_REPORT_QUERY = gql`
  query BillingReport($from: Date, $to: Date, $sellerId: UUID) {
    billingReport(from: $from, to: $to, sellerId: $sellerId) {
      rows {
        installmentId
        orderId
        sequence
        clientId
        clientName
        factoryId
        factoryName
        sellerId
        sellerName
        invoicedAt
        dueDate
        amount
        commissionAmount
        situation
        paidAt
        daysOverdue
        isCommissionReceived
      }
      installmentCount
      orderCount
      totalAmount
      paidAmount
      dueAmount
      overdueAmount
      overdueCount
      commissionAmount
    }
  }
`;
