import { gql } from "@apollo/client";

// Criação de item durante o wizard de novo pedido. O backend não aceita itens
// no CreateOrderInput, então o pedido é criado primeiro e cada item do rascunho
// é gravado em seguida com o orderId retornado.
export const CREATE_ORDER_ITEM_MUTATION = gql`
  mutation CreateOrderItemForNewOrder($input: CreateOrderItemInput!) {
    createOrderItem(input: $input) {
      status
      code
      message
      data {
        id
      }
    }
  }
`;
