import { gql } from "@apollo/client";

export const DELETE_PRODUCT_MUTATION = gql`
  mutation DeleteProduct($id: UUID!) {
    deleteProduct(id: $id) {
      status
      message
    }
  }
`;
