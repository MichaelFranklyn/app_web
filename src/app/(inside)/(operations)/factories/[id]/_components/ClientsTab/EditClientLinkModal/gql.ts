import { gql } from "@apollo/client";

export const UPDATE_SELLER_CLIENT_FACTORY_MUTATION = gql`
  mutation UpdateFactoryClientLink(
    $id: UUID!
    $input: UpdateSellerClientFactoryInput!
  ) {
    updateSellerClientFactory(id: $id, input: $input) {
      status
      message
      data {
        id
        priority
        priceTierId
        priceTier {
          id
          name
        }
      }
    }
  }
`;
