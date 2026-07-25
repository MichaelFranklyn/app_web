import { gql } from "@apollo/client";

export const UPDATE_MY_PASSWORD_MUTATION = gql`
  mutation UpdateMyPassword($input: UpdateMyPasswordInput!) {
    updateMyPassword(input: $input) {
      status
      code
      message
    }
  }
`;
