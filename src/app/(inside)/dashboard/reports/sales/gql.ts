import { gql } from "@apollo/client";

/**
 * As linhas do relatório: os pedidos JÁ FATURADOS do recorte.
 *
 * Traz o vendedor e a comissão porque é o que se confere contra a planilha da
 * fábrica — e `invoicedAt`, que é a data pela qual o período recorta aqui.
 */
export const SALES_REPORT_ORDERS_QUERY = gql`
  query SalesReportOrders($input: BaseListInput!) {
    sales_report_orders: orders(input: $input) {
      edges {
        node {
          id
          orderDate
          invoicedAt
          totalAmount
          commissionAmount
          status
          seller {
            id
            name
          }
          client {
            id
            razaoSocial
            nomeFantasia
          }
          factory {
            id
            razaoSocial
            nomeFantasia
            nickname
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

/** Fechamento do recorte — os mesmos filtros da tabela (a paginação é ignorada). */
export const SALES_REPORT_STATS_QUERY = gql`
  query SalesReportStats($input: BaseListInput!) {
    sales_report_stats: orderStats(input: $input) {
      totalOrders
      totalAmount
      avgTicket
      commissionAmount
    }
  }
`;

export const INVOICED_BY_FACTORY_QUERY = gql`
  query InvoicedRevenueByFactory(
    $from: Date
    $to: Date
    $sellerId: UUID
    $limit: Int
  ) {
    invoicedRevenueByFactory(
      from: $from
      to: $to
      sellerId: $sellerId
      limit: $limit
    ) {
      entityId
      entityName
      total
      orderCount
      commissionAmount
    }
  }
`;

export const INVOICED_BY_MONTH_QUERY = gql`
  query InvoicedRevenueByMonth($from: Date, $to: Date, $sellerId: UUID) {
    invoicedRevenueByMonth(from: $from, to: $to, sellerId: $sellerId) {
      month
      total
      orderCount
      commissionAmount
    }
  }
`;
