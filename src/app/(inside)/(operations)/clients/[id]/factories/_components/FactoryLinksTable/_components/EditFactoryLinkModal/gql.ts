import { gql } from "@apollo/client";

export const UPDATE_SELLER_CLIENT_FACTORY_MUTATION = gql`
  mutation UpdateSellerClientFactory(
    $id: UUID!
    $input: UpdateSellerClientFactoryInput!
  ) {
    updateSellerClientFactory(id: $id, input: $input) {
      status
      message
      data {
        id
        priority
        visitFrequencyDays
        factoryClientCode
        lastVisitDate
        factory {
          id
          nomeFantasia
          nickname
          razaoSocial
        }
        seller {
          id
          name
        }
      }
    }
  }
`;
