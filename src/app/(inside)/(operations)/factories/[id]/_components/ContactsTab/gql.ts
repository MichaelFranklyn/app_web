import { gql } from "@apollo/client";

/**
 * Contatos da fábrica — quem atende o representante do outro lado.
 *
 * O backend já servia o CRUD inteiro; faltava a tela. Quem depende dela é o
 * "Enviar à fábrica" do pedido: sem um contato com telefone, o WhatsApp não
 * tem para onde abrir, e a mensagem de erro de lá aponta justamente para esta
 * aba.
 */
export const FACTORY_CONTACTS_QUERY = gql`
  query FactoryContacts($factoryId: UUID!, $input: BaseListInput!) {
    factoryContacts(factoryId: $factoryId, input: $input) {
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

export const CREATE_FACTORY_CONTACT_MUTATION = gql`
  mutation CreateFactoryContact($input: CreateFactoryContactInput!) {
    createFactoryContact(input: $input) {
      status
      message
      # Os campos são os da LINHA: é com este retorno que o contato novo entra
      # na tabela sem esperar o refetch.
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

export const UPDATE_FACTORY_CONTACT_MUTATION = gql`
  mutation UpdateFactoryContact(
    $id: UUID!
    $input: UpdateFactoryContactInput!
  ) {
    updateFactoryContact(id: $id, input: $input) {
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

export const DELETE_FACTORY_CONTACT_MUTATION = gql`
  mutation DeleteFactoryContact($id: UUID!) {
    deleteFactoryContact(id: $id) {
      status
      message
    }
  }
`;
