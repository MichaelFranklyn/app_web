import { gql } from "@apollo/client";

/**
 * As ações de higienização da carteira. Usadas pela ficha do cliente e pela
 * tela de higienização — por isso moram aqui, no pai das duas rotas.
 */

export const END_COMPANY_CLIENT_MUTATION = gql`
  mutation EndCompanyClient($id: UUID!, $input: EndCompanyClientInput!) {
    endCompanyClient(id: $id, input: $input) {
      status
      message
      data {
        cancelledVisits
        companyClient {
          id
          isActive
          status
          statusReason
          statusChangedAt
        }
      }
    }
  }
`;

export const REACTIVATE_COMPANY_CLIENT_MUTATION = gql`
  mutation ReactivateCompanyClient($id: UUID!) {
    reactivateCompanyClient(id: $id) {
      status
      message
      data {
        id
        isActive
        status
        statusReason
        statusChangedAt
      }
    }
  }
`;

export const TRANSFER_COMPANY_CLIENT_CNPJ_MUTATION = gql`
  mutation TransferCompanyClientCnpj(
    $id: UUID!
    $input: TransferCompanyClientCnpjInput!
  ) {
    transferCompanyClientCnpj(id: $id, input: $input) {
      status
      message
      data {
        movedLinks
        movedContacts
        newCompanyClient {
          id
        }
      }
    }
  }
`;

export const REFRESH_CLIENT_FROM_RECEITA_MUTATION = gql`
  mutation RefreshClientFromReceita($companyClientId: UUID!) {
    refreshClientFromReceita(companyClientId: $companyClientId) {
      status
      message
      data {
        client {
          id
          razaoSocial
          nomeFantasia
          receitaStatus
          receitaCheckedAt
        }
        changes {
          field
          before
          after
        }
      }
    }
  }
`;
