import { gql } from "@apollo/client";

export const PRODUCT_TAXES_QUERY = gql`
  query ProductTaxes($input: BaseListInput!) {
    product_taxes: productTaxes(input: $input) {
      edges {
        node {
          id
          rate
          updatedAt
          taxRule {
            id
            name
          }
        }
      }
      totalCount
    }
  }
`;

export const UPDATE_PRODUCT_TAX_MUTATION = gql`
  mutation UpdateProductTax($id: UUID!, $input: UpdateProductTaxInput!) {
    updateProductTax(id: $id, input: $input) {
      status
      message
      data {
        id
        rate
        updatedAt
        taxRule {
          id
          name
        }
      }
    }
  }
`;

export const TAX_RULES_QUERY = gql`
  query TaxRulesOptions($input: BaseListInput!) {
    taxRules(input: $input) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const CREATE_TAX_RULE_MUTATION = gql`
  mutation CreateTaxRule($input: CreateTaxRuleInput!) {
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
  mutation AddTaxToProduct($input: CreateProductTaxInput!) {
    addTaxToProduct(input: $input) {
      status
      message
      data {
        id
        rate
        taxRule {
          id
          name
        }
      }
    }
  }
`;

export const REMOVE_TAX_FROM_PRODUCT_MUTATION = gql`
  mutation RemoveTaxFromProduct($id: UUID!) {
    removeTaxFromProduct(id: $id) {
      status
      message
    }
  }
`;
