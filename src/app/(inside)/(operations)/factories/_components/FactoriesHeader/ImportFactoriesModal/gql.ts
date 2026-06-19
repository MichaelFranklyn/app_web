import { gql } from "@apollo/client";

export const IMPORT_COMPANY_FACTORIES_MUTATION = gql`
  mutation ImportCompanyFactories($input: ImportCompanyFactoriesInput!) {
    importCompanyFactories(input: $input) {
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
