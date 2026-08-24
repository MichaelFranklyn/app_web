import { gql } from "@apollo/client";

/**
 * As pendências de quem consulta, calculadas na hora.
 *
 * Uma consulta só para a tela inteira: o backend já sabe varrer carteira,
 * pedidos, boletos e metas, e nove idas à rede para desenhar nove cartões
 * deixariam a tela pintando em cascata.
 */
export const MY_INSIGHTS_QUERY = gql`
  query MyInsights($sellerId: UUID) {
    myInsights(sellerId: $sellerId) {
      status
      message
      data {
        generatedAt
        insights {
          kind
          group
          count
          amount
          daysLeft
          samples {
            id
            label
            detail
            link
          }
        }
      }
    }
  }
`;

/** Vendedores para o seletor do gestor — o mesmo catálogo curto das metas. */
export const INSIGHTS_SELLERS_QUERY = gql`
  query InsightsSellers($input: BaseListInput!) {
    insights_sellers: sellers(input: $input) {
      edges {
        node {
          id
          name
          isActive
        }
      }
      totalCount
    }
  }
`;
