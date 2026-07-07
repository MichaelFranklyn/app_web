import { gql } from "@apollo/client";

// Nº de pedidos por fábrica (top `limit`), maiores volumes primeiro.
export const ORDERS_BY_FACTORY_QUERY = gql`
  query OrdersByFactory($from: Date, $to: Date, $sellerId: UUID, $limit: Int) {
    ordersByFactory(from: $from, to: $to, sellerId: $sellerId, limit: $limit) {
      entityId
      entityName
      orderCount
    }
  }
`;
