import { gql } from "@apollo/client";

export const IMPORT_COMPANY_CLIENTS_MUTATION = gql`
  mutation ImportCompanyClients($input: ImportCompanyClientsInput!) {
    importCompanyClients(input: $input) {
      status
      message
      data {
        total
        created
        linksCreated
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

/**
 * A carteira atual, no formato da planilha (uma linha por cliente × fábrica),
 * e as listas das colunas de vendedor e de fábrica.
 */
export const COMPANY_CLIENTS_IMPORT_SHEET_QUERY = gql`
  query CompanyClientsImportSheet {
    companyClientsImportSheet {
      status
      message
      data {
        rows {
          cnpj
          notes
          sellerEmail
          factoryName
        }
        sellerEmails
        factoryNames
      }
    }
  }
`;
