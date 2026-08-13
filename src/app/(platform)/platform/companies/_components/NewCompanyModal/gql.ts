import { gql } from "@apollo/client";

export const PROVISION_COMPANY_MUTATION = gql`
  mutation provisionCompany($input: ProvisionCompanyInput!) {
    provisionCompany(input: $input) {
      status
      code
      message
      data {
        company {
          id
          cnpj
          razaoSocial
          nomeFantasia
          segment
        }
        owner {
          id
          name
          email
          role
        }
        firstAccessLink
      }
    }
  }
`;
