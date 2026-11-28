import { gql } from "@apollo/client";

/** O vínculo do cliente com a fábrica do lote, para trazer o código dele lá. */
export const PDF_CLIENT_FACTORY_CODE_QUERY = gql`
  query PdfClientFactoryCode($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          factoryClientCode
        }
      }
    }
  }
`;
