import { gql } from "@apollo/client";

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
