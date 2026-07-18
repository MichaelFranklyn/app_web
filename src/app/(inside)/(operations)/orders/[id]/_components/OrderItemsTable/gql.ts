import { gql } from "@apollo/client";

export const ORDER_ITEMS_QUERY = gql`
  query OrderItems($orderId: UUID!) {
    orderItems(orderId: $orderId) {
      edges {
        node {
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
          avgShelfDays
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
      totalCount
    }
  }
`;

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
