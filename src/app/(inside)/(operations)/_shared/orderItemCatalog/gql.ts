import { gql } from "@apollo/client";

// Catálogo do item de pedido (leitura), compartilhado entre a criação do pedido
// (/orders) e a edição de itens no detalhe (/orders/[id]). A empresa pode ter
// vários vínculos de fábrica; localizamos o company_factory da fábrica do pedido
// para então achar a tabela de preço ativa e seus itens (produto/nível/preço).
export const ORDER_ITEM_COMPANY_FACTORIES_QUERY = gql`
  query OrderItemCompanyFactories($input: BaseListInput!) {
    companyFactories(input: $input) {
      edges {
        node {
          id
          factoryId
          ipiInOrder
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

// Todos os produtos do catálogo da fábrica — o vendedor pode adicionar qualquer
// produto ao pedido, tenha ele preço na tabela ativa ou não. Com pageInfo:
// catálogos reais passam de 1000 linhas e o hook pagina até o fim.
export const ORDER_ITEM_PRODUCTS_QUERY = gql`
  query OrderItemProducts($input: BaseListInput!) {
    products(input: $input) {
      edges {
        node {
          id
          name
          sku
          saleMultiple
          unitPerPack
          unit {
            id
            label
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

// Todos os níveis comerciais da fábrica — o nível é opcional ao digitar o item.
export const ORDER_ITEM_TIERS_QUERY = gql`
  query OrderItemTiers($input: BaseListInput!) {
    priceTiers(input: $input) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

// Com pageInfo: a tabela ativa tem produtos × níveis linhas (milhares num
// catálogo real) e o hook pagina até o fim — truncar deixaria itens sem preço.
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
