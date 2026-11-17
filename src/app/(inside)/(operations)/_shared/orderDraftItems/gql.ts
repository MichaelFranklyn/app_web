import { gql } from "@apollo/client";

// Gravação dos itens do rascunho depois que o pedido existe (o backend não
// aceita itens no CreateOrderInput). Uma chamada só, numa transação só: ou os
// itens entram todos, ou nenhum entra.
export const CREATE_ORDER_ITEMS_MUTATION = gql`
  mutation CreateOrderItemsForNewOrder(
    $orderId: UUID!
    $items: [OrderItemLineInput!]!
  ) {
    createOrderItems(orderId: $orderId, items: $items) {
      status
      code
      message
      data {
        id
      }
    }
  }
`;
