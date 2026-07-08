import { gql } from "@apollo/client";

export const REGISTER_COMPANY_MUTATION = gql`
  mutation registerCompany($input: RegisterCompanyInput!) {
    registerCompany(input: $input) {
      status
      code
      message
      data {
        accessToken
        refreshToken
        userId
        userName
        companyName
        role
      }
    }
  }
`;
