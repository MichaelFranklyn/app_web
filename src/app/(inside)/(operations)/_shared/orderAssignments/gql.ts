import { gql } from "@apollo/client";

/**
 * Vínculos vendedor→cliente de uma fábrica. Usada pela página de novo pedido
 * aberta a partir da fábrica e pelo modal de importar da aba Pedidos dela.
 */
export const FACTORY_ASSIGNMENTS_QUERY = gql`
  query FactoryAssignments($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          sellerId
          clientId
          # Negativado nesta fábrica: ela não aceita pedido novo deste cliente.
          isNegative
          negativeReason
          seller {
            id
            name
          }
          client {
            id
            razaoSocial
            nomeFantasia
            cnpj
          }
          # Alimenta a sugestão de "dura quantos dias na loja?" no fechamento.
          cadence {
            days
            source
          }
        }
      }
      # O total é o que denuncia o truncamento: sem ele, o select de cliente
      # não teria como saber que a fábrica tem mais vínculos do que coube na
      # resposta (ver useCompleteList).
      totalCount
    }
  }
`;
