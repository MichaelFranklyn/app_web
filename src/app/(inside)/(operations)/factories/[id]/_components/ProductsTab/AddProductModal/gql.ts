import { gql } from "@apollo/client";

export const PRODUCT_CATEGORIES_QUERY = gql`
  query ProductCategoriesOptions($input: BaseListInput!) {
    productCategories(input: $input) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const PRODUCT_UNITS_QUERY = gql`
  query ProductUnitsOptions($input: BaseListInput!) {
    productUnits(input: $input) {
      edges {
        node {
          id
          label
        }
      }
    }
  }
`;

export const CREATE_PRODUCT_UNIT_MUTATION = gql`
  mutation CreateProductUnitInline($input: CreateProductUnitInput!) {
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

export const CREATE_PRODUCT_UNIT_LABEL_MUTATION = gql`
  mutation CreateProductUnitLabelInline($input: CreateProductUnitLabelInput!) {
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

export const PRODUCT_UNIT_LABELS_QUERY = gql`
  query ProductUnitLabelsOptions($input: BaseListInput!) {
    productUnitLabels(input: $input) {
      edges {
        node {
          id
          label
        }
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
