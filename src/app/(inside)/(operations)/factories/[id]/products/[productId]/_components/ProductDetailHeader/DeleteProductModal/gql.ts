import { gql } from "@apollo/client";

export const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProductFromDetail($id: UUID!) {
    deleteProduct(id: $id) {
      status
      message
    }
  }
`;
