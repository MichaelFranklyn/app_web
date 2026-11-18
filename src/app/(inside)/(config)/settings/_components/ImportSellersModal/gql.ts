import { gql } from "@apollo/client";

export const IMPORT_SELLERS_MUTATION = gql`
  mutation ImportSellers($input: ImportSellersInput!) {
    importSellers(input: $input) {
      status
      message
      data {
        total
        created
        failed
        errors {
          row
          email
          message
        }
        accessEmailsDeferred
      }
    }
  }
`;
