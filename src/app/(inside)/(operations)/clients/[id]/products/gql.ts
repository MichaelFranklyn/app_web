import { gql } from "@apollo/client";

/**
 * O histórico de compras do cliente lido por produto. Fica nesta aba (e não no
 * `gql.ts` do pai) porque nenhuma outra a consome: o que sobe para o pai é o
 * que dois irmãos compartilham.
 */
export const CLIENT_PRODUCT_ANALYSIS_QUERY = gql`
  query ClientProductAnalysis(
    $companyClientId: UUID!
    $factoryId: UUID
    $months: Int
  ) {
    clientProductAnalysis(
      companyClientId: $companyClientId
      factoryId: $factoryId
      months: $months
    ) {
      productId
      factoryId
      orderCount
      factoryOrderCount
      firstPurchaseDate
      lastPurchaseDate
      daysSinceLast
      totalUnits
      avgUnits
      lastUnits
      totalAmount
      avgIntervalDays
      expectedNextDate
      overdueDays
      status
      product {
        id
        name
        sku
      }
      factory {
        id
        razaoSocial
        nomeFantasia
        nickname
      }
    }
  }
`;
