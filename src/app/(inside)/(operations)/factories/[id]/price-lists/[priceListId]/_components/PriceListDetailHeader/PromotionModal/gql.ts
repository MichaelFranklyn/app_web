import { gql } from "@apollo/client";

// Todos os itens da tabela (produto × nível), para montar a promoção. Paginado
// por cursor no cliente (ver useApolloClient loop no index) — tabelas reais
// passam de mil linhas.
export const PROMOTION_ITEMS_QUERY = gql`
  query PromotionItems($input: BaseListInput!) {
    priceListItems(input: $input) {
      edges {
        node {
          id
          unitPrice
          promoPrice
          product {
            id
            name
            sku
            unitPerPack
          }
          tier {
            id
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const SET_PRICE_LIST_PROMOTION_MUTATION = gql`
  mutation SetPriceListPromotion($input: SetPriceListPromotionInput!) {
    setPriceListPromotion(input: $input) {
      status
      message
      data {
        id
        promoStartsOn
        promoEndsOn
        isPromoActive
      }
    }
  }
`;

export const CLEAR_PRICE_LIST_PROMOTION_MUTATION = gql`
  mutation ClearPriceListPromotion($priceListId: UUID!) {
    clearPriceListPromotion(priceListId: $priceListId) {
      status
      message
      data {
        id
        promoStartsOn
        promoEndsOn
        isPromoActive
      }
    }
  }
`;
