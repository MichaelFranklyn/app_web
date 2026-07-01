import { gql } from "@apollo/client";

// Último pedido do cliente naquela fábrica (para sugerir os produtos a observar).
export const LAST_CLIENT_ORDER_QUERY = gql`
  query LastClientOrder($input: BaseListInput!) {
    orders(input: $input) {
      edges {
        node {
          id
          orderDate
        }
      }
    }
  }
`;

export const ORDER_ITEMS_FOR_STOCK_QUERY = gql`
  query OrderItemsForStock($orderId: UUID!) {
    orderItems(orderId: $orderId) {
      edges {
        node {
          id
          product {
            id
            name
            sku
          }
        }
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
          observation
          notes
        }
      }
    }
  }
`;

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

export const UPDATE_VISIT_ITEM_MUTATION = gql`
  mutation UpdateVisitScheduleItem(
    $id: UUID!
    $input: UpdateVisitScheduleItemInput!
  ) {
    updateVisitScheduleItem(id: $id, input: $input) {
      status
      message
      data {
        id
        status
        outcome
        stockObservation
        notes
      }
    }
  }
`;

export const RESCHEDULE_VISIT_MUTATION = gql`
  # input.targetDate (Date) remarca para uma data livre; o backend cria o dia/semana se faltar.
  mutation RescheduleVisit($input: RescheduleVisitInput!) {
    rescheduleVisit(input: $input) {
      status
      message
      data {
        originalItem {
          id
          status
        }
        newItem {
          id
        }
      }
    }
  }
`;
