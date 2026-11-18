/**
 * Texto puro, e não `gql` do Apollo: quem consome é o `gqlFetch` do servidor
 * (mesmo formato de `services/plan/gql.ts`).
 */
export const COMPANY_SETUP_PENDING_QUERY = /* GraphQL */ `
  query CompanySetupPending {
    companySetupPending
  }
`;

export const COMPANY_SETUP_STEPS_QUERY = /* GraphQL */ `
  query CompanySetupSteps {
    companySetupProgress {
      data {
        steps {
          key
          isDone
          isRequired
        }
      }
    }
  }
`;
