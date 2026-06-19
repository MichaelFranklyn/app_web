import { gql } from "@apollo/client";

export const DELETE_SELLER_CLIENT_FACTORY_MUTATION = gql`
  mutation UnlinkFactoryClient($id: UUID!) {
    deleteSellerClientFactory(id: $id) {
      status
      message
    }
  }
`;
