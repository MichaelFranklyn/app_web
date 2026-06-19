import { gql } from "@apollo/client";

export const REQUEST_PASSWORD_RESET_MUTATION = gql`
  mutation RequestPasswordReset($input: RequestPasswordResetInput!) {
    requestPasswordReset(input: $input) {
      status
      code
      message
    }
  }
`;
