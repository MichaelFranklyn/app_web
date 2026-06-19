import { gql } from "@apollo/client";

export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($id: UUID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
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
