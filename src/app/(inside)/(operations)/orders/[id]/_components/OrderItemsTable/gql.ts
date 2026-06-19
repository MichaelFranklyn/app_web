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

// Opções para o modal de adicionar item: a empresa pode ter vários vínculos
// de fábrica; localizamos o company_factory da fábrica deste pedido para
// então achar a tabela de preço ativa e seus itens (produto/nível/preço).
export const ORDER_ITEM_COMPANY_FACTORIES_QUERY = gql`
  query OrderItemCompanyFactories($input: BaseListInput!) {
    companyFactories(input: $input) {
      edges {
        node {
          id
          factoryId
        }
      }
    }
  }
`;

export const ORDER_ITEM_PRICE_LISTS_QUERY = gql`
  query OrderItemPriceLists($input: BaseListInput!) {
    factoryPriceLists(input: $input) {
      edges {
        node {
          id
          name
          isActive
          validFrom
          validUntil
        }
      }
    }
  }
`;

export const ORDER_ITEM_PRICE_LIST_ITEMS_QUERY = gql`
  query OrderItemPriceListItems($input: BaseListInput!) {
    priceListItems(input: $input) {
      edges {
        node {
          id
          unitPrice
          product {
            id
            name
            sku
            saleMultiple
            unitLabel {
              id
              label
            }
          }
          tier {
            id
            name
          }
        }
      }
    }
  }
`;
