import { gql } from "@apollo/client";

export const DELETE_PRODUCT_CATEGORY_MUTATION = gql`
  mutation DeleteProductCategory($id: UUID!) {
    deleteProductCategory(id: $id) {
      status
      message
    }
  }
`;
