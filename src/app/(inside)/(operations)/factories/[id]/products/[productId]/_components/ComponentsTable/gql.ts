import { gql } from "@apollo/client";

export const PRODUCT_COMPONENTS_QUERY = gql`
  query ProductComponents($id: UUID!) {
    product_components_detail: product(id: $id) {
      status
      message
      data {
        id
        components {
          id
          quantity
          updatedAt
          componentProductId
          component {
            id
            sku
            name
            unitLabel {
              id
              label
            }
          }
        }
      }
    }
  }
`;

export const COMPONENT_PRODUCTS_OPTIONS_QUERY = gql`
  query ComponentProductsOptions($input: BaseListInput!) {
    products(input: $input) {
      edges {
        node {
          id
          sku
          name
        }
      }
    }
  }
`;

export const ADD_COMPONENT_TO_PRODUCT_MUTATION = gql`
  mutation AddComponentToProduct($input: CreateProductComponentInput!) {
    addComponentToProduct(input: $input) {
      status
      message
      data {
        id
        quantity
        componentProductId
      }
    }
  }
`;

export const UPDATE_PRODUCT_COMPONENT_MUTATION = gql`
  mutation UpdateProductComponent($id: UUID!, $input: UpdateProductComponentInput!) {
    updateProductComponent(id: $id, input: $input) {
      status
      message
      data {
        id
        quantity
      }
    }
  }
`;

export const REMOVE_COMPONENT_FROM_PRODUCT_MUTATION = gql`
  mutation RemoveComponentFromProduct($id: UUID!) {
    removeComponentFromProduct(id: $id) {
      status
      message
    }
  }
`;
