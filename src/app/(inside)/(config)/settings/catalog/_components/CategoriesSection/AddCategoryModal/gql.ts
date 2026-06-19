import { gql } from "@apollo/client";

export const CREATE_PRODUCT_CATEGORY_MUTATION = gql`
  mutation CreateProductCategoryTab($input: CreateProductCategoryInput!) {
    createProductCategory(input: $input) {
      status
      message
      data {
        id
        name
        segment
      }
    }
  }
`;
