import { gql } from "@apollo/client";

export const CREATE_CLIENT_CONTACT_MUTATION = gql`
  mutation CreateClientContact($input: CreateClientContactInput!) {
    createClientContact(input: $input) {
      status
      message
      data {
        id
        name
        role
        phone
        email
        isPrimary
        isActive
      }
    }
  }
`;
