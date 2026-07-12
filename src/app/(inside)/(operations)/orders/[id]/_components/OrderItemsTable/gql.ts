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
          avgShelfDays
          source
          product {
            id
            name
            saleMultiple
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
        source
        product {
          id
          name
          saleMultiple
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
