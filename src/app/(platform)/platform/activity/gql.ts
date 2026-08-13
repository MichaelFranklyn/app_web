import { gql } from "@apollo/client";

export const PLATFORM_ACTIVITY_QUERY = gql`
  query PlatformActivityList($input: BaseListInput!) {
    platform_activity: platformActivity(input: $input) {
      edges {
        node {
          id
          createdAt
          operation
          status
          errorMessage
          durationMs
          companyId
          userEmail
          userRole
          targetIds
        }
      }
      totalCount
    }
  }
`;

/** Só o nome, para o cabeçalho do recorte por empresa. A ficha inteira do
 * tenant tem sua própria tela — aqui um `platformTenant` completo seria uma
 * consulta cara para escrever quatro palavras. */
export const COMPANY_NAME_QUERY = gql`
  query PlatformActivityCompanyName($id: UUID!) {
    platformTenant(id: $id) {
      status
      data {
        id
        razaoSocial
        nomeFantasia
      }
    }
  }
`;

export const ACTIVITY_SUMMARY_QUERY = gql`
  query PlatformActivitySummary($companyId: UUID) {
    platformActivitySummary(companyId: $companyId) {
      status
      code
      message
      data {
        totalActions
        totalErrors
        byOperation {
          key
          total
          errors
        }
        byDay {
          key
          total
          errors
        }
      }
    }
  }
`;
