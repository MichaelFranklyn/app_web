import { gql } from "@apollo/client";

export const UPDATE_SELLER_FACTORY_ACCESS_MUTATION = gql`
  mutation UpdateSellerFactoryAccessFromFactory(
    $id: UUID!
    $input: UpdateSellerFactoryAccessInput!
  ) {
    updateSellerFactoryAccess(id: $id, input: $input) {
      status
      message
      data {
        id
        isActive
      }
    }
  }
`;
