import { gql } from "@apollo/client";

export const IMPORT_COMPANY_CLIENTS_MUTATION = gql`
  mutation ImportCompanyClients($input: ImportCompanyClientsInput!) {
    importCompanyClients(input: $input) {
      status
      message
      data {
        total
        created
        skipped
        failed
        errors {
          row
          cnpj
          message
        }
        ignored {
          row
          cnpj
          message
        }
      }
    }
  }
`;
