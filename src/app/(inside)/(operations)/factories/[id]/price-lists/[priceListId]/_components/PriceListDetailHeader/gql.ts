import { gql } from "@apollo/client";

export const UPDATE_FACTORY_PRICE_LIST_MUTATION = gql`
  mutation UpdatePriceListFromDetail(
    $id: UUID!
    $input: UpdateFactoryPriceListInput!
  ) {
    updateFactoryPriceList(id: $id, input: $input) {
      status
      message
      data {
        id
        name
        validFrom
        validUntil
        isActive
      }
    }
  }
`;

export const DELETE_FACTORY_PRICE_LIST_MUTATION = gql`
  mutation DeletePriceListFromDetail($id: UUID!) {
    deleteFactoryPriceList(id: $id) {
      status
      message
    }
  }
`;
