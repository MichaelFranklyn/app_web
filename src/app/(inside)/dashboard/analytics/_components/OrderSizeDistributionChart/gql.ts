import { gql } from "@apollo/client";

// Distribuição dos pedidos por faixa de valor. O backend devolve SEMPRE as
// cinco faixas, da menor para a maior (faixa sem pedido vem zerada).
export const ORDER_SIZE_DISTRIBUTION_QUERY = gql`
  query OrderSizeDistribution($from: Date, $to: Date, $sellerId: UUID) {
    orderSizeDistribution(from: $from, to: $to, sellerId: $sellerId) {
      band
      label
      orderCount
      totalAmount
      share
    }
  }
`;
