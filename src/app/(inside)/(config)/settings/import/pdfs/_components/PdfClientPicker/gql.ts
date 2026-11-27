import { gql } from "@apollo/client";

/** Clientes da carteira para vincular a um PDF sem CNPJ (busca por nome e CNPJ). */
export const PDF_CLIENT_OPTIONS_QUERY = gql`
  query PdfClientOptions($input: BaseListInput!) {
    pdf_client_options: companyClients(input: $input) {
      edges {
        node {
          id
          client {
            id
            razaoSocial
            nomeFantasia
            cnpj
          }
        }
      }
      totalCount
    }
  }
`;
