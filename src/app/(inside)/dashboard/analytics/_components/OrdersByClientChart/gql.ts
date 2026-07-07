import { gql } from "@apollo/client";

// Nº de pedidos por cliente (top `limit`), maiores volumes primeiro.
export const ORDERS_BY_CLIENT_QUERY = gql`
  query OrdersByClient($from: Date, $to: Date, $sellerId: UUID, $limit: Int) {
    ordersByClient(from: $from, to: $to, sellerId: $sellerId, limit: $limit) {
      entityId
      entityName
      orderCount
    }
  }
`;
