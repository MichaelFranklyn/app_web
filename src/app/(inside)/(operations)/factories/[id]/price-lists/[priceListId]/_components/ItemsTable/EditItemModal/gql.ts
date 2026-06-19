import { gql } from "@apollo/client";

export const UPDATE_PRICE_LIST_ITEM_MUTATION = gql`
  mutation UpdatePriceListItem(
    $id: UUID!
    $input: UpdatePriceListItemInput!
  ) {
    updatePriceListItem(id: $id, input: $input) {
      status
      message
      data {
        id
        unitPrice
        unitPriceWithImpost
      }
    }
  }
`;
