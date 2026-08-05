import { gql } from "@apollo/client";

/** As linhas: os pedidos colocados na fábrica no período (pela data do pedido). */
export const SENT_ORDERS_QUERY = gql`
  query SentOrdersReport($input: BaseListInput!) {
    sent_orders_report: orders(input: $input) {
      edges {
        node {
          id
          orderDate
          invoicedAt
          totalAmount
          commissionAmount
          status
          isDeliveryOverdue
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

/**
 * Fechamento do recorte. `invoicedOrders`/`invoicedAmount` são o que a fábrica já
 * faturou dentre os pedidos colocados — o resto é o que ainda está lá.
 */
export const SENT_ORDERS_STATS_QUERY = gql`
  query SentOrdersReportStats($input: BaseListInput!) {
    sent_orders_report_stats: orderStats(input: $input) {
      totalOrders
      totalAmount
      avgTicket
      invoicedOrders
      invoicedAmount
    }
  }
`;

export const PLACED_BY_FACTORY_QUERY = gql`
  query PlacedOrdersByFactory(
    $from: Date
    $to: Date
    $sellerId: UUID
    $limit: Int
  ) {
    placedOrdersByFactory(
      from: $from
      to: $to
      sellerId: $sellerId
      limit: $limit
    ) {
      entityId
      entityName
      orderCount
      total
      invoicedCount
      invoicedAmount
    }
  }
`;
