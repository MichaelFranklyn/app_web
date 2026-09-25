import { gql } from "@apollo/client";

export const CLIENT_HYGIENE_QUERY = gql`
  query ClientHygiene {
    clientHygiene {
      receitaPending
      items {
        receitaStatus
        lastOrderDate
        reasons
        companyClient {
          id
          status
          createdAt
          client {
            id
            cnpj
            razaoSocial
            nomeFantasia
            nickname
          }
        }
      }
    }
  }
`;

export const CHECK_WALLET_RECEITA_MUTATION = gql`
  mutation CheckWalletReceita($limit: Int) {
    checkWalletReceita(limit: $limit) {
      status
      message
      data {
        checked
        inactiveFound
        stoppedByLimit
        remaining
      }
    }
  }
`;
