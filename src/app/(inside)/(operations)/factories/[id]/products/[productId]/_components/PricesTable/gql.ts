import { gql } from "@apollo/client";

export const PRICE_LIST_ITEMS_QUERY = gql`
  query ProductPriceListItems($input: BaseListInput!) {
    price_list_items: priceListItems(input: $input) {
      edges {
        node {
          id
          unitPrice
          unitPriceWithImpost
          priceList {
            id
            name
            validFrom
            validUntil
            isActive
          }
          tier {
            id
            name
          }
        }
      }
      totalCount
    }
  }
`;

export const FACTORY_PRICE_LISTS_OPTIONS_QUERY = gql`
  query ProductFactoryPriceListsOptions($input: BaseListInput!) {
    factoryPriceLists(input: $input) {
      edges {
        node {
          id
          name
          isActive
        }
      }
    }
  }
`;

export const PRICE_TIERS_OPTIONS_QUERY = gql`
  query ProductPriceTiersOptions($input: BaseListInput!) {
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
  mutation CreateProductPriceListItem($input: CreatePriceListItemInput!) {
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

export const UPDATE_PRICE_LIST_ITEM_MUTATION = gql`
  mutation UpdateProductPriceListItem(
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

export const DELETE_PRICE_LIST_ITEM_MUTATION = gql`
  mutation DeletePriceListItem($id: UUID!) {
    deletePriceListItem(id: $id) {
      status
      message
    }
  }
`;
