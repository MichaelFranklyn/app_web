import { gql } from "@apollo/client";

/**
 * Uma linha por fábrica: o que foi colocado nela no período.
 *
 * Sem `limit`: o gráfico de Desempenho corta nas 8 maiores porque um ranking
 * ilegível não informa, mas aqui a fábrica pequena é justamente a que se vai
 * conferir ("por que a Silvana caiu?"). A paginação da tela é local.
 */
export const FACTORY_ORDERS_REPORT_QUERY = gql`
  query FactoryOrdersReport($from: Date, $to: Date, $sellerId: UUID) {
    factoryOrdersReport(from: $from, to: $to, sellerId: $sellerId) {
      entityId
      entityName
      orderCount
      totalAmount
      avgTicket
      clientCount
      invoicedCount
      invoicedAmount
      commissionAmount
      lastOrderDate
      share
    }
  }
`;
