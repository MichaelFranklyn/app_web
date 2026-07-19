import { gql } from "@apollo/client";

// Query dos itens hasteada para o gql do pai ([id]/gql.ts) por ser compartilhada
// com o botão de PDF; re-exportada aqui para os consumidores locais da tabela.
export { ORDER_ITEMS_QUERY } from "../../gql";

export const CREATE_ORDER_ITEM_MUTATION = gql`
  mutation CreateOrderItem($input: CreateOrderItemInput!) {
    createOrderItem(input: $input) {
      status
      code
      message
      data {
        id
        quantity
        unitsTotal
        unitPrice
        discount
        subtotal
        ipiRate
        ipiAmount
        taxAmount
        unitPriceWithTax
        isPromo
        source
        createdAt
        product {
          id
          name
          sku
          saleMultiple
          unitPerPack
          taxes {
            id
            rate
            taxRule {
              id
              name
            }
          }
        }
        tier {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_ORDER_ITEM_MUTATION = gql`
  mutation UpdateOrderItem($id: UUID!, $input: UpdateOrderItemInput!) {
    updateOrderItem(id: $id, input: $input) {
      status
      code
      message
      data {
        id
        quantity
        unitsTotal
        unitPrice
        discount
        subtotal
        ipiRate
        ipiAmount
        taxAmount
        unitPriceWithTax
      }
    }
  }
`;

export const DELETE_ORDER_ITEM_MUTATION = gql`
  mutation DeleteOrderItem($id: UUID!) {
    deleteOrderItem(id: $id) {
      status
      code
      message
    }
  }
`;
