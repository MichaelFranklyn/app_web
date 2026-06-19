import { gql } from "@apollo/client";

export const REVOKE_SELLER_FACTORY_ACCESS_MUTATION = gql`
  mutation RevokeSellerFactoryAccess($id: UUID!, $input: UpdateSellerFactoryAccessInput!) {
    updateSellerFactoryAccess(id: $id, input: $input) {
      status
      message
    }
  }
`;
