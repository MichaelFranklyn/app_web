import { gql } from "@apollo/client";

export const UPDATE_CLIENT_NOTES_MUTATION = gql`
  mutation UpdateClientNotes($id: UUID!, $input: UpdateClientNotesInput!) {
    updateClientNotes(id: $id, input: $input) {
      status
      code
      message
      data {
        id
        notes
      }
    }
  }
`;
