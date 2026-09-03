import { gql } from "@apollo/client";

export const DELETE_SELLER_FACTORY_ACCESS_MUTATION = gql`
  mutation DeleteSellerFactoryAccess($id: UUID!) {
    deleteSellerFactoryAccess(id: $id) {
      status
      message
    }
  }
`;
