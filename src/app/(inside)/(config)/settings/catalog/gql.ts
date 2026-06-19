import { gql } from "@apollo/client";

export const PRODUCT_UNITS_QUERY = gql`
  query SettingsProductUnits($input: BaseListInput!) {
    productUnits(input: $input) {
      edges {
        node {
          id
          label
          isActive
        }
      }
      totalCount
    }
  }
`;

export const CREATE_PRODUCT_UNIT_MUTATION = gql`
  mutation SettingsCreateProductUnit($input: CreateProductUnitInput!) {
    createProductUnit(input: $input) {
      status
      message
      data {
        id
        label
      }
    }
  }
`;

export const UPDATE_PRODUCT_UNIT_MUTATION = gql`
  mutation SettingsUpdateProductUnit($id: UUID!, $input: UpdateProductUnitInput!) {
    updateProductUnit(id: $id, input: $input) {
      status
      message
      data {
        id
        label
      }
    }
  }
`;

export const DELETE_PRODUCT_UNIT_MUTATION = gql`
  mutation SettingsDeleteProductUnit($id: UUID!) {
    deleteProductUnit(id: $id) {
      status
      message
    }
  }
`;

export const PRODUCT_UNIT_LABELS_QUERY = gql`
  query SettingsProductUnitLabels($input: BaseListInput!) {
    productUnitLabels(input: $input) {
      edges {
        node {
          id
          label
          isActive
        }
      }
      totalCount
    }
  }
`;

export const CREATE_PRODUCT_UNIT_LABEL_MUTATION = gql`
  mutation SettingsCreateProductUnitLabel($input: CreateProductUnitLabelInput!) {
    createProductUnitLabel(input: $input) {
      status
      message
      data {
        id
        label
      }
    }
  }
`;

export const UPDATE_PRODUCT_UNIT_LABEL_MUTATION = gql`
  mutation SettingsUpdateProductUnitLabel(
    $id: UUID!
    $input: UpdateProductUnitLabelInput!
  ) {
    updateProductUnitLabel(id: $id, input: $input) {
      status
      message
      data {
        id
        label
      }
    }
  }
`;

export const DELETE_PRODUCT_UNIT_LABEL_MUTATION = gql`
  mutation SettingsDeleteProductUnitLabel($id: UUID!) {
    deleteProductUnitLabel(id: $id) {
      status
      message
    }
  }
`;

export const TAX_RULES_QUERY = gql`
  query SettingsTaxRules($input: BaseListInput!) {
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
  mutation SettingsCreateTaxRule($input: CreateTaxRuleInput!) {
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

export const UPDATE_TAX_RULE_MUTATION = gql`
  mutation SettingsUpdateTaxRule($id: UUID!, $input: UpdateTaxRuleInput!) {
    updateTaxRule(id: $id, input: $input) {
      status
      message
      data {
        id
        name
      }
    }
  }
`;

export const DELETE_TAX_RULE_MUTATION = gql`
  mutation SettingsDeleteTaxRule($id: UUID!) {
    deleteTaxRule(id: $id) {
      status
      message
    }
  }
`;
