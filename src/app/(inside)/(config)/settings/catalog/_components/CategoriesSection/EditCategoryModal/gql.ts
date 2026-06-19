import { gql } from "@apollo/client";

export const UPDATE_PRODUCT_CATEGORY_MUTATION = gql`
  mutation UpdateProductCategory(
    $id: UUID!
    $input: UpdateProductCategoryInput!
  ) {
    updateProductCategory(id: $id, input: $input) {
      status
      message
      data {
        id
        name
        segment
      }
    }
  }
`;
