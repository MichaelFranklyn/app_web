import { gql } from "@apollo/client";

// Produtos observáveis na visita, agrupados por fábrica. Traz TODAS as fábricas
// que o vendedor atende para o cliente — na loja ele pergunta pelo estoque de
// qualquer catálogo, não só da fábrica que motivou a ida.
export const VISIT_STOCK_CANDIDATES_QUERY = gql`
  query VisitStockCandidates($itemId: UUID!) {
    visitStockCandidates(itemId: $itemId) {
      sellerClientFactoryId
      sellerId
      clientId
      isFocus
      source
      lastOrderDate
      factory {
        id
        nomeFantasia
        razaoSocial
      }
      products {
        id
        name
        sku
      }
    }
  }
`;

export const VISIT_STOCK_OBSERVATIONS_QUERY = gql`
  query VisitStockObservations($itemId: UUID!, $input: BaseListInput!) {
    visitStockObservations(itemId: $itemId, input: $input) {
      edges {
        node {
          id
          productId
          daysRemaining
          observation
          notes
        }
      }
    }
  }
`;

// Pedido lançado de dentro da visita. `visitScheduleItemId` amarra o pedido à ida
// que o originou: é o que responde depois se a visita sugerida pelo score vendeu.
export const CREATE_VISIT_ORDER_MUTATION = gql`
  mutation CreateVisitOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      status
      message
      data {
        id
      }
    }
  }
`;

// Salvar as observações corrige a previsão de esgotamento de cada produto no
// backend (FeedStockObservationsUseCase), que é a fonte da urgência do próximo
// score — por isso o cliente refetcha o score depois de salvar.
export const SAVE_VISIT_STOCK_OBSERVATIONS_MUTATION = gql`
  mutation SaveVisitStockObservations(
    $itemId: UUID!
    $observations: [UpsertStockObservationInput!]!
  ) {
    saveVisitStockObservations(itemId: $itemId, observations: $observations) {
      status
      message
      data {
        id
        productId
        observation
      }
    }
  }
`;
