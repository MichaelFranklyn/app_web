import { gql } from "@apollo/client";

// Agregações "ranking por entidade" (vendedor/fábrica/cliente). Todas devolvem
// o mesmo formato (entityId/entityName + valor + orderCount), consumido pelo
// componente genérico EntityRankingChart.

export const AVG_TICKET_BY_SELLER_QUERY = gql`
  query AvgTicketBySeller(
    $from: Date
    $to: Date
    $sellerId: UUID
    $limit: Int
  ) {
    avgTicketBySeller(
      from: $from
      to: $to
      sellerId: $sellerId
      limit: $limit
    ) {
      entityId
      entityName
      avgTicket
      orderCount
    }
  }
`;

export const AVG_TICKET_BY_FACTORY_QUERY = gql`
  query AvgTicketByFactory(
    $from: Date
    $to: Date
    $sellerId: UUID
    $limit: Int
  ) {
    avgTicketByFactory(
      from: $from
      to: $to
      sellerId: $sellerId
      limit: $limit
    ) {
      entityId
      entityName
      avgTicket
      orderCount
    }
  }
`;

export const AVG_TICKET_BY_CLIENT_QUERY = gql`
  query AvgTicketByClient(
    $from: Date
    $to: Date
    $sellerId: UUID
    $limit: Int
  ) {
    avgTicketByClient(
      from: $from
      to: $to
      sellerId: $sellerId
      limit: $limit
    ) {
      entityId
      entityName
      avgTicket
      orderCount
    }
  }
`;

export const ORDER_INTERVAL_BY_FACTORY_QUERY = gql`
  query OrderIntervalByFactory(
    $from: Date
    $to: Date
    $sellerId: UUID
    $limit: Int
  ) {
    orderIntervalByFactory(
      from: $from
      to: $to
      sellerId: $sellerId
      limit: $limit
    ) {
      entityId
      entityName
      avgDays
      orderCount
    }
  }
`;

export const ORDER_INTERVAL_BY_CLIENT_QUERY = gql`
  query OrderIntervalByClient(
    $from: Date
    $to: Date
    $sellerId: UUID
    $limit: Int
  ) {
    orderIntervalByClient(
      from: $from
      to: $to
      sellerId: $sellerId
      limit: $limit
    ) {
      entityId
      entityName
      avgDays
      orderCount
    }
  }
`;
