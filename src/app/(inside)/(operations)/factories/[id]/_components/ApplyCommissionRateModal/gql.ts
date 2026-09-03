import { gql } from "@apollo/client";

/**
 * O que muda se a taxa atual da fábrica for aplicada ao que já foi faturado.
 *
 * A comissão é congelada no faturamento: mudar a taxa no vínculo não mexe
 * sozinha nos pedidos já lançados. Esta prévia é o número que se olha antes de
 * decidir — a correção vale para a carteira inteira daquela fábrica.
 */
export const APPLY_COMMISSION_RATE_PREVIEW_QUERY = gql`
  query FactoryCommissionRatePreview($factoryId: UUID!) {
    applyCommissionRatePreview(factoryId: $factoryId) {
      rate
      orders
      installments
      currentTotal
      newTotal
      skipped
    }
  }
`;

export const APPLY_COMMISSION_RATE_MUTATION = gql`
  mutation ApplyFactoryCommissionRate($factoryId: UUID!) {
    applyCommissionRate(factoryId: $factoryId) {
      status
      code
      message
    }
  }
`;
