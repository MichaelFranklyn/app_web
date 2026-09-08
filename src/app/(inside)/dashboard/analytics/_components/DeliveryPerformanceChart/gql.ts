import { gql } from "@apollo/client";

export const DELIVERY_PERFORMANCE_QUERY = gql`
  query DeliveryPerformanceByFactory(
    $from: Date
    $to: Date
    $sellerId: UUID
    $factoryId: UUID
    $limit: Int
  ) {
    deliveryPerformanceByFactory(
      from: $from
      to: $to
      sellerId: $sellerId
      factoryId: $factoryId
      limit: $limit
    ) {
      entityId
      entityName
      avgEstimatedDays
      avgActualDays
      lateRate
      deliveredCount
    }
  }
`;
