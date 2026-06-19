import { gql } from "@apollo/client";

export const UPDATE_USER_MUTATION = gql`
  mutation updateUser($id: UUID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      status
      code
      message
      data {
        id
      }
    }
  }
`;

