import { gql } from "@apollo/client";

/**
 * Operações dos atendimentos, compartilhadas entre rotas (fonte única).
 *
 * Três telas leem a mesma entidade — a fila (`/support`), o caso aberto
 * (`/support/[id]`) e a aba do cliente —, e a seleção de campos precisa ser a
 * mesma: com duas definições, um campo novo aparece numa tela e falta na outra,
 * e o cache do Apollo passa a guardar o mesmo caso com dois formatos.
 */

/** Campos da LINHA da fila (e da aba do cliente). */
const SUPPORT_CASE_ROW = gql`
  fragment SupportCaseRow on ClientSupportCaseType {
    id
    title
    category
    status
    priority
    amount
    reportedAt
    resolvedAt
    ageDays
    isOpen
    clientId
    client {
      id
      razaoSocial
      nomeFantasia
    }
    factory {
      id
      razaoSocial
      nomeFantasia
      nickname
    }
    seller {
      id
      name
    }
    assignedTo {
      id
      name
    }
    lastUpdate {
      id
      caseId
      kind
      body
      statusFrom
      statusTo
      createdAt
      author {
        id
        name
      }
    }
    createdAt
  }
`;

export const SUPPORT_CASES_QUERY = gql`
  ${SUPPORT_CASE_ROW}
  query ClientSupportCases($input: BaseListInput!) {
    support_cases: clientSupportCases(input: $input) {
      edges {
        node {
          ...SupportCaseRow
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;

export const SUPPORT_COUNTS_QUERY = gql`
  query ClientSupportCounts {
    clientSupportCounts {
      status
      count
    }
  }
`;

/** O caso inteiro, com a linha do tempo — a tela de detalhe. */
export const SUPPORT_CASE_QUERY = gql`
  ${SUPPORT_CASE_ROW}
  query ClientSupportCase($id: UUID!) {
    clientSupportCase(id: $id) {
      status
      message
      data {
        ...SupportCaseRow
        description
        resolution
        order {
          id
          orderDate
          invoiceNumber
        }
        openedBy {
          id
          name
        }
        updates {
          id
          caseId
          kind
          body
          statusFrom
          statusTo
          createdAt
          author {
            id
            name
          }
        }
      }
    }
  }
`;

export const CREATE_SUPPORT_CASE_MUTATION = gql`
  mutation CreateClientSupportCase($input: CreateClientSupportCaseInput!) {
    createClientSupportCase(input: $input) {
      status
      message
      data {
        id
        title
        status
      }
    }
  }
`;

export const UPDATE_SUPPORT_CASE_MUTATION = gql`
  mutation UpdateClientSupportCase(
    $id: UUID!
    $input: UpdateClientSupportCaseInput!
  ) {
    updateClientSupportCase(id: $id, input: $input) {
      status
      message
      data {
        id
        title
        priority
        category
      }
    }
  }
`;

/** Andamento — e a mudança de situação, quando vier junto. */
export const ADD_SUPPORT_UPDATE_MUTATION = gql`
  mutation AddClientSupportUpdate($input: AddClientSupportUpdateInput!) {
    addClientSupportUpdate(input: $input) {
      status
      message
      data {
        id
        kind
        body
        statusFrom
        statusTo
        createdAt
      }
    }
  }
`;

export const DELETE_SUPPORT_CASE_MUTATION = gql`
  mutation DeleteClientSupportCase($id: UUID!) {
    deleteClientSupportCase(id: $id) {
      status
      code
      message
    }
  }
`;
