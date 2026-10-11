import { gql } from "@apollo/client";

/**
 * As oportunidades de quem consulta, calculadas na hora.
 *
 * A API ainda se chama `myInsights` (a tela já foi /insights); o que ela
 * devolve hoje são só as oportunidades comerciais — o trabalho a resolver mora
 * em `myPendingItems`, e as metas no dashboard.
 */
export const MY_OPPORTUNITIES_QUERY = gql`
  query MyOpportunities($sellerId: UUID) {
    myInsights(sellerId: $sellerId) {
      status
      message
      data {
        generatedAt
        insights {
          kind
          count
          blockedCount
          samples {
            id
            label
            detail
            link
            reason
            clientId
            nextFollowUpDate
            nextVisitDate
          }
        }
      }
    }
  }
`;

/** Vendedores para o seletor do gestor — o mesmo catálogo curto das metas. */
export const OPPORTUNITIES_SELLERS_QUERY = gql`
  query OpportunitiesSellers($input: BaseListInput!) {
    opportunities_sellers: sellers(input: $input) {
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
 * A lista COMPLETA de uma oportunidade — aberta na própria página, uma página
 * por vez, e só quando alguém abre o cartão.
 */
export const OPPORTUNITY_CASES_QUERY = gql`
  query MyOpportunityCases(
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
          clientId
          nextFollowUpDate
          nextVisitDate
        }
      }
    }
  }
`;
