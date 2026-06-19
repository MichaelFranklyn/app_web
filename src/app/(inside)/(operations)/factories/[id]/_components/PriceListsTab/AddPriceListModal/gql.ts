import { gql } from "@apollo/client";

export const CREATE_FACTORY_PRICE_LIST_MUTATION = gql`
  mutation CreateFactoryPriceList($input: CreateFactoryPriceListInput!) {
    createFactoryPriceList(input: $input) {
      status
      message
      data {
        id
        name
        region
        validFrom
        validUntil
        isActive
        clonedFromId
      }
    }
  }
`;
