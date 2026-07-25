import { gql } from "@apollo/client";

/**
 * Dados de vendedor do perfil. A mutation é a mesma que a tabela /sellers usa,
 * declarada aqui porque cada página tem o seu gql (não há import cruzado entre
 * rotas) — e /sellers/[id] deixou de existir quando o perfil virou a tela única.
 */
export const UPDATE_SELLER_MUTATION = gql`
  mutation UpdateSellerFromProfile($id: UUID!, $input: UpdateSellerInput!) {
    updateSeller(id: $id, input: $input) {
      status
      message
    }
  }
`;
