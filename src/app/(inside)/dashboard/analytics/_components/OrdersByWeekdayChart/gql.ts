import { gql } from "@apollo/client";

// Pedidos por dia da semana (data do pedido). O backend devolve SEMPRE os sete
// dias, de segunda a domingo.
export const ORDERS_BY_WEEKDAY_QUERY = gql`
  query OrdersByWeekday($from: Date, $to: Date, $sellerId: UUID) {
    ordersByWeekday(from: $from, to: $to, sellerId: $sellerId) {
      weekday
      label
      orderCount
      totalAmount
      share
    }
  }
`;
