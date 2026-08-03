import { gql } from "@apollo/client";

// Todos os produtos da fábrica, só com o necessário para casar o arquivo com o
// SKU e para o usuário escolher à mão o que não casou. Passa por `useAllPages`:
// catálogo real tem mais de uma página, e o produto que ficasse de fora
// apareceria como "sem correspondência" sem motivo aparente.
export const UPLOAD_PHOTOS_PRODUCTS_QUERY = gql`
  query UploadPhotosProducts($input: BaseListInput!) {
    upload_photos_products: products(input: $input) {
      edges {
        node {
          id
          sku
          name
          imageUrl
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const SET_PRODUCT_IMAGES_MUTATION = gql`
  mutation SetProductImages($input: SetProductImagesInput!) {
    setProductImages(input: $input) {
      status
      message
      data {
        total
        updated
        failed
        errors {
          fileName
          message
        }
      }
    }
  }
`;
