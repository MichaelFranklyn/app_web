import { gql } from "@apollo/client";

/**
 * Vínculos vendedor→fábrica do cliente, para o novo pedido aberto a partir da
 * tela dele (`?clientId=`): o pedido nasce de um vínculo, não de uma cascata.
 */
export const CLIENT_ASSIGNMENTS_QUERY = gql`
  query ClientAssignments($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          sellerId
          factoryId
          # Negativado nesta fábrica: o vínculo aparece marcado e o backend
          # recusa o pedido — o vendedor precisa ver isso ao escolher, não
          # depois de montar o pedido.
          isNegative
          negativeReason
          seller {
            id
            name
          }
          factory {
            id
            nomeFantasia
            nickname
            razaoSocial
          }
          # O nome do cliente vai no cabeçalho da página.
          client {
            id
            razaoSocial
            nomeFantasia
          }
          # Sugere "dura quantos dias na loja?" já preenchido.
          cadence {
            days
            source
          }
        }
      }
      totalCount
    }
  }
`;
