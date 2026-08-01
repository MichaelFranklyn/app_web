import { gql } from "@apollo/client";

// Nº de pedidos por entidade (top `limit`), maiores volumes primeiro. As duas
// agregações devolvem o mesmo formato (entityId/entityName + orderCount), então
// o gráfico é parametrizado por query/dataKey em vez de duplicado.

export const ORDERS_BY_CLIENT_QUERY = gql`
  query OrdersByClient($from: Date, $to: Date, $sellerId: UUID, $limit: Int) {
    ordersByClient(from: $from, to: $to, sellerId: $sellerId, limit: $limit) {
      entityId
      entityName
      orderCount
    }
  }
`;

export const ORDERS_BY_SELLER_QUERY = gql`
  query OrdersBySeller($from: Date, $to: Date, $sellerId: UUID, $limit: Int) {
    ordersBySeller(from: $from, to: $to, sellerId: $sellerId, limit: $limit) {
      entityId
      entityName
      orderCount
    }
  }
`;
