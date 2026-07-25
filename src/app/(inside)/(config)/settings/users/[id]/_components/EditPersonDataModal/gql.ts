import { gql } from "@apollo/client";

/**
 * O gestor completando o cadastro de alguém. É a mesma mutation da tabela de
 * pessoas, declarada aqui porque cada página tem o seu gql — e agora ela carrega
 * também os dados pessoais (CPF, contato e endereço), que saíram de `sellers`.
 *
 * Sem este caminho, um vendedor recém-criado ficaria sem endereço até entrar no
 * sistema por conta própria — e sem endereço não há rota do dia.
 */
export const UPDATE_PERSON_DATA_MUTATION = gql`
  mutation UpdatePersonData($id: UUID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      status
      code
      message
      data {
        id
        name
        email
        phone
        cpf
        birthDate
        addressZip
        addressStreet
        addressNumber
        addressComplement
        addressNeighborhood
        addressCity
        addressState
        updatedAt
      }
    }
  }
`;
