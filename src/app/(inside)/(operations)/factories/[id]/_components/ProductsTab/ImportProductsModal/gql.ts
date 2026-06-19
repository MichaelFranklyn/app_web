import { gql } from "@apollo/client";

export const PRODUCT_UNITS_QUERY = gql`
  query ImportProductUnits($input: BaseListInput!) {
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

export const PRODUCT_UNIT_LABELS_QUERY = gql`
  query ImportProductUnitLabels($input: BaseListInput!) {
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

export const IMPORT_PRODUCTS_MUTATION = gql`
  mutation ImportProducts($input: ImportProductsInput!) {
    importProducts(input: $input) {
      status
      message
      data {
        total
        created
        skipped
        failed
        errors {
          row
          sku
          message
        }
        ignored {
          row
          sku
          message
        }
      }
    }
  }
`;
