import { gql } from "@apollo/client";

export const PRICE_LIST_ITEMS_QUERY = gql`
  query PriceListItems($input: BaseListInput!) {
    price_list_items: priceListItems(input: $input) {
      edges {
        node {
          id
          unitPrice
          unitPriceWithImpost
          product {
            id
            name
            sku
            isActive
            unitPerPack
            unit {
              id
              label
            }
            unitLabel {
              id
              label
            }
          }
          tier {
            id
            name
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;
