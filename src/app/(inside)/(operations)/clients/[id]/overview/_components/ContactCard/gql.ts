import { gql } from "@apollo/client";

export const CLIENT_CONTACTS_QUERY = gql`
  query ClientContacts($clientId: UUID!, $input: BaseListInput!) {
    clientContacts(clientId: $clientId, input: $input) {
      edges {
        node {
          id
          name
          role
          phone
          email
          isPrimary
          isActive
        }
      }
      totalCount
    }
  }
`;

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

export const UPDATE_CLIENT_CONTACT_MUTATION = gql`
  mutation UpdateClientContact($id: UUID!, $input: UpdateClientContactInput!) {
    updateClientContact(id: $id, input: $input) {
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

export const DELETE_CLIENT_CONTACT_MUTATION = gql`
  mutation DeleteClientContact($id: UUID!) {
    deleteClientContact(id: $id) {
      status
      message
    }
  }
`;
