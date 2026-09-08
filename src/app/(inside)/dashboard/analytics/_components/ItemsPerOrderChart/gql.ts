import { gql } from "@apollo/client";

// Profundidade do pedido médio de cada fábrica: itens diferentes e peças.
export const ITEMS_PER_ORDER_BY_FACTORY_QUERY = gql`
  query ItemsPerOrderByFactory(
    $from: Date
    $to: Date
    $sellerId: UUID
    $factoryId: UUID
    $limit: Int
  ) {
    itemsPerOrderByFactory(
      from: $from
      to: $to
      sellerId: $sellerId
      factoryId: $factoryId
      limit: $limit
    ) {
      entityId
      entityName
      avgItems
      avgUnits
      orderCount
    }
  }
`;
