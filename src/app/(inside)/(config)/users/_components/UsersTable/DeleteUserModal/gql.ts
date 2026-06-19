import { gql } from "@apollo/client";

export const DELETE_USER_MUTATION = gql`
  mutation DeleteUser($id: UUID!) {
    deleteUser(id: $id) {
      status
      message
    }
  }
`;
