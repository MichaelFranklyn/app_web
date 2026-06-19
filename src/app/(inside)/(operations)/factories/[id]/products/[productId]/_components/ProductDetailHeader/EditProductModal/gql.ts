import { gql } from "@apollo/client";

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProductFromDetail($id: UUID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      status
      code
      message
      data {
        id
        name
        sku
        ncm
        unitPerPack
        saleMultiple
        isActive
        unitId
        unitLabelId
        category {
          id
          name
          segment
        }
      }
    }
  }
`;

export const PRODUCT_CATEGORIES_OPTIONS_QUERY = gql`
  query ProductCategoriesOptions($input: BaseListInput!) {
    product_categories_options: productCategories(input: $input) {
      edges {
        node {
          id
          name
          segment
        }
      }
    }
  }
`;

export const PRODUCT_UNITS_OPTIONS_QUERY = gql`
  query DetailProductUnitsOptions($input: BaseListInput!) {
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

export const PRODUCT_UNIT_LABELS_OPTIONS_QUERY = gql`
  query DetailProductUnitLabelsOptions($input: BaseListInput!) {
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
