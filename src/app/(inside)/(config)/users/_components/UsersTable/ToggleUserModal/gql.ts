import { gql } from "@apollo/client";

export const TOGGLE_USER_MUTATION = gql`
  mutation ToggleUser($id: UUID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      status
      message
    }
  }
`;
