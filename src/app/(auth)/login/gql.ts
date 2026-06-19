import { gql } from "@apollo/client";

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
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
