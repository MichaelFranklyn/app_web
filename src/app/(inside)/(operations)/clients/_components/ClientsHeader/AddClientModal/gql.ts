import { gql } from "@apollo/client";

export const ADD_CLIENT_TO_COMPANY_MUTATION = gql`
  mutation AddClientToCompany($input: AddClientToCompanyInput!) {
    addClientToCompany(input: $input) {
      status
      code
      message
      data {
        id
        clientId
      }
    }
  }
`;
