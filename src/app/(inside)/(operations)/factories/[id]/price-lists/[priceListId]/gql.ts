import { gql } from "@apollo/client";

export const PRICE_LIST_DETAIL_QUERY = gql`
  query PriceListDetail($id: UUID!) {
    price_list_detail: factoryPriceList(id: $id) {
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
