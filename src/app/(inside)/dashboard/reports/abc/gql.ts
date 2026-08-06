import { gql } from "@apollo/client";

/**
 * A curva ABC dos clientes pelo FATURADO no período — a mesma base da aba
 * Vendas e da comissão.
 *
 * Sem corte de top-N: a curva ABC existe justamente para olhar a cauda (a
 * classe C), e um ranking dos 10 maiores responderia outra pergunta.
 */
export const CLIENT_ABC_CURVE_QUERY = gql`
  query ClientAbcCurve($from: Date, $to: Date, $sellerId: UUID) {
    clientAbcCurve(from: $from, to: $to, sellerId: $sellerId) {
      clientId
      clientName
      rank
      totalAmount
      orderCount
      commissionAmount
      share
      cumulativeShare
      abcClass
      lastOrderDate
    }
  }
`;
