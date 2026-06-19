import { gql } from "@apollo/client";

export const UPDATE_MY_PROFILE_MUTATION = gql`
  mutation UpdateMyProfile($input: UpdateMyProfileInput!) {
    updateMyProfile(input: $input) {
      status
      code
      message
      data {
        id
        name
        email
        role
        updatedAt
      }
    }
  }
`;
