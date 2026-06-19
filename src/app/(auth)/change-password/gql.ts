import { gql } from "@apollo/client";

export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input) {
      status
      code
      message
      data {
        accessToken
        refreshToken
        userName
        companyName
        role
      }
    }
  }
`;
