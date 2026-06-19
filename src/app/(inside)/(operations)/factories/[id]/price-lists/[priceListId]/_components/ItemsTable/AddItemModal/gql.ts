import { gql } from "@apollo/client";

export const PRODUCTS_OPTIONS_QUERY = gql`
  query AddItemProductOptions($input: BaseListInput!) {
    products(input: $input) {
      edges {
        node {
          id
          name
          sku
          unitLabel {
            id
            label
          }
        }
      }
    }
  }
`;

export const TIERS_OPTIONS_QUERY = gql`
  query AddItemTierOptions($input: BaseListInput!) {
    priceTiers(input: $input) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

export const CREATE_PRICE_LIST_ITEM_MUTATION = gql`
  mutation CreatePriceListItem($input: CreatePriceListItemInput!) {
    createPriceListItem(input: $input) {
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
