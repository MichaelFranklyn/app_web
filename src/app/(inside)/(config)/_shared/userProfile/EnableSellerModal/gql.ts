import { gql } from "@apollo/client";

/**
 * Dá perfil de campo a quem já tem login. É a mutation certa para o caso
 * "proprietário que também vende": `CreateSellerUseCase` reaproveita o usuário do
 * e-mail informado e **preserva o papel** de owner/admin — trocar o papel para
 * "Vendedor" no cadastro, em vez disso, rebaixaria o acesso da pessoa.
 */
export const CREATE_SELLER_PROFILE_MUTATION = gql`
  mutation CreateSellerProfile($input: CreateSellerInput!) {
    createSeller(input: $input) {
      status
      message
      data {
        id
        region
        isActive
      }
    }
  }
`;
