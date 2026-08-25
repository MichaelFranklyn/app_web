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
          blockedCount
          amount
          daysLeft
          samples {
            id
            label
            detail
            link
            reason
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

/**
 * A lista COMPLETA de uma pendência — o que há por trás do "e mais 174".
 *
 * Consulta à parte, e só quando alguém pede: a tela abre com nove cartões, e
 * carregar as centenas de casos de todos eles para mostrar três de cada
 * pagaria o preço da lista inteira sem ninguém tê-la pedido.
 */
export const INSIGHT_CASES_QUERY = gql`
  query MyInsightCases(
    $kind: InsightKind!
    $sellerId: UUID
    $offset: Int!
    $limit: Int!
  ) {
    myInsightCases(
      kind: $kind
      sellerId: $sellerId
      offset: $offset
      limit: $limit
    ) {
      status
      message
      data {
        kind
        totalCount
        cases {
          id
          label
          detail
          link
          reason
        }
      }
    }
  }
`;
