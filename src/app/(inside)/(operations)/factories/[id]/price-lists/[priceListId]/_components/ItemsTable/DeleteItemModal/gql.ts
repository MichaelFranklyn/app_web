import { gql } from "@apollo/client";

export const DELETE_PRICE_LIST_ITEM_MUTATION = gql`
  mutation DeletePriceListItem($id: UUID!) {
    deletePriceListItem(id: $id) {
      status
      message
    }
  }
`;
