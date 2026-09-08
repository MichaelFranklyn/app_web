import { gql } from "@apollo/client";

// Quanto do volume de cada mês é sobra (backorder) de faturamento parcial.
export const BACKORDER_BY_MONTH_QUERY = gql`
  query BackorderByMonth(
    $from: Date
    $to: Date
    $sellerId: UUID
    $factoryId: UUID
  ) {
    backorderByMonth(
      from: $from
      to: $to
      sellerId: $sellerId
      factoryId: $factoryId
    ) {
      month
      newOrders
      backorders
      backorderShare
      backorderAmount
    }
  }
`;
