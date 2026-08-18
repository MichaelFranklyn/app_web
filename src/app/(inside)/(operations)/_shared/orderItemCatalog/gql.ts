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
          # Piso de frete grátis (só CIF): o aviso "faltam R$ X para o frete
          # grátis em CIF" sai daqui, aproveitando a consulta que o wizard já
          # faz para resolver o vínculo da fábrica.
          freeFreightCifAmount
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

// Opções do select de produto: uma PÁGINA do catálogo, filtrada no servidor
// pelo termo digitado (`name,sku` com `like`). Só os campos que o rótulo e a
// miniatura usam — o resto do nó vem depois, e apenas para o produto escolhido.
//
// Varrer o catálogo inteiro para montar este select era o que fazia o modal
// demorar a abrir: uma fábrica real tem milhares de produtos, e o vendedor
// escolhe um.
export const ORDER_ITEM_PRODUCT_OPTIONS_QUERY = gql`
  query OrderItemProductOptions($input: BaseListInput!) {
    products(input: $input) {
      edges {
        node {
          id
          name
          sku
          imageUrl
        }
      }
    }
  }
`;

// O nó completo dos produtos JÁ ESCOLHIDOS (filtro `id in [...]`) — é daqui que
// saem unidade, múltiplo de venda e IPI. Buscar por id mantém os mapas
// completos para todos os itens do pedido sem trazer o catálogo inteiro.
//
// `taxes` traz o IPI vinculado ao produto (venha ele do import da tabela, do
// modelo de pedido ou do cadastro manual). Resolvido por DataLoader no backend,
// então não custa uma query por produto.
export const ORDER_ITEM_PRODUCTS_QUERY = gql`
  query OrderItemProducts($input: BaseListInput!) {
    products(input: $input) {
      edges {
        node {
          id
          name
          sku
          imageUrl
          saleMultiple
          unitPerPack
          unit {
            id
            label
          }
          taxes {
            id
            rate
            calcType
            taxRule {
              id
              name
            }
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

// Nível comercial acordado com este cliente nesta fábrica (1 linha por
// company×client×factory). É o padrão do item de pedido — sem ele o vendedor
// teria de escolher o nível a cada item só para o preço aparecer.
export const ORDER_ITEM_LINKED_TIER_QUERY = gql`
  query OrderItemLinkedTier($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          priceTierId
        }
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

// Preços da tabela ativa PARA OS PRODUTOS ESCOLHIDOS (`product_id in [...]`).
// A tabela inteira tem produtos × níveis linhas (1728 numa fábrica real); o que
// sugere o preço de um item são as poucas linhas do produto dele.
export const ORDER_ITEM_PRICE_LIST_ITEMS_QUERY = gql`
  query OrderItemPriceListItems($input: BaseListInput!) {
    priceListItems(input: $input) {
      edges {
        node {
          id
          unitPrice
          effectiveUnitPrice
          isPromoActive
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
