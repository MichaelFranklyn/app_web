import { gql } from "@apollo/client";

export const ORDERS_BY_MONTH_QUERY = gql`
  query OrdersByMonth(
    $from: Date
    $to: Date
    $sellerId: UUID
    $factoryId: UUID
  ) {
    ordersByMonth(
      from: $from
      to: $to
      sellerId: $sellerId
      factoryId: $factoryId
    ) {
      month
      count
    }
  }
`;
