import { gql } from "@apollo/client";

/** Regras de imposto da empresa (opções do passo "Impostos"). */
export const TAX_RULES_QUERY = gql`
  query AddProductTaxRules($input: BaseListInput!) {
    taxRules(input: $input) {
      edges {
        node {
          id
          name
        }
      }
      totalCount
    }
  }
`;

export const CREATE_TAX_RULE_MUTATION = gql`
  mutation AddProductCreateTaxRule($input: CreateTaxRuleInput!) {
    createTaxRule(input: $input) {
      status
      message
      data {
        id
        name
      }
    }
  }
`;

export const ADD_TAX_TO_PRODUCT_MUTATION = gql`
  mutation AddProductTax($input: CreateProductTaxInput!) {
    addTaxToProduct(input: $input) {
      status
      message
      data {
        id
      }
    }
  }
`;

/** Tabelas de preço e níveis da fábrica (opções do passo "Preços"). */
export const FACTORY_PRICE_LISTS_OPTIONS_QUERY = gql`
  query AddProductPriceLists($input: BaseListInput!) {
    factoryPriceLists(input: $input) {
      edges {
        node {
          id
          name
          isActive
        }
      }
      totalCount
    }
  }
`;

export const PRICE_TIERS_OPTIONS_QUERY = gql`
  query AddProductPriceTiers($input: BaseListInput!) {
    priceTiers(input: $input) {
      edges {
        node {
          id
          name
        }
      }
      totalCount
    }
  }
`;

export const CREATE_PRICE_LIST_ITEM_MUTATION = gql`
  mutation AddProductPriceListItem($input: CreatePriceListItemInput!) {
    createPriceListItem(input: $input) {
      status
      message
      data {
        id
      }
    }
  }
`;

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      status
      message
      data {
        id
        sku
        name
        ncm
        imageUrl
        unitPerPack
        isActive
        unitId
        unitLabelId
        unit {
          id
          label
        }
        unitLabel {
          id
          label
        }
        category {
          id
          name
        }
      }
    }
  }
`;
