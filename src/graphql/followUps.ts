import { gql } from "@apollo/client";

/**
 * Operações dos contatos agendados (follow-up), compartilhadas entre rotas.
 *
 * A lista, o agendamento aberto, a aba do cliente e o pedido leem a mesma
 * entidade: uma seleção de campos só, para o cache do Apollo não guardar o
 * mesmo agendamento com dois formatos.
 */

const FOLLOW_UP_ROW = gql`
  fragment FollowUpRow on ClientFollowUpType {
    id
    clientId
    companyClientId
    client {
      id
      razaoSocial
      nomeFantasia
    }
    orderId
    order {
      id
      orderDate
      invoiceNumber
    }
    responsibleUserId
    responsible {
      id
      name
      isActive
    }
    dueDate
    reason
    notes
    status
    situation
    daysLate
    closedAt
    outcome
    rescheduleCount
    isCommercial
  }
`;

export const FOLLOW_UPS_QUERY = gql`
  ${FOLLOW_UP_ROW}
  query ClientFollowUps($input: BaseListInput!) {
    follow_ups: clientFollowUps(input: $input) {
      edges {
        node {
          ...FollowUpRow
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

export const FOLLOW_UP_COUNTS_QUERY = gql`
  query ClientFollowUpCounts($clientId: UUID, $responsibleUserId: UUID) {
    clientFollowUpCounts(
      clientId: $clientId
      responsibleUserId: $responsibleUserId
    ) {
      situation
      count
    }
  }
`;

/** Contatos em aberto com alguém desativado — só o gestor pergunta. */
export const FOLLOW_UP_ORPHAN_COUNT_QUERY = gql`
  query ClientFollowUpOrphanCount {
    clientFollowUpOrphanCount
  }
`;

/** O agendamento com a história inteira — a tela de detalhe. */
export const FOLLOW_UP_QUERY = gql`
  ${FOLLOW_UP_ROW}
  query ClientFollowUp($id: UUID!) {
    clientFollowUp(id: $id) {
      status
      message
      data {
        ...FollowUpRow
        createdAt
        previousId
        defaultCommercial
        linkedReturn {
          itemId
          returnDate
          agreedOn
        }
        openReturn {
          itemId
          returnDate
          agreedOn
        }
        createdBy {
          id
          name
        }
        next {
          id
          dueDate
        }
        events {
          id
          kind
          note
          dateFrom
          dateTo
          userFrom {
            id
            name
          }
          userTo {
            id
            name
          }
          author {
            id
            name
          }
          createdAt
        }
      }
    }
  }
`;

export const CREATE_FOLLOW_UP_MUTATION = gql`
  mutation CreateClientFollowUp($input: CreateClientFollowUpInput!) {
    createClientFollowUp(input: $input) {
      status
      message
      data {
        id
        status
        dueDate
      }
    }
  }
`;

export const UPDATE_FOLLOW_UP_MUTATION = gql`
  mutation UpdateClientFollowUp(
    $id: UUID!
    $input: UpdateClientFollowUpInput!
  ) {
    updateClientFollowUp(id: $id, input: $input) {
      status
      message
      data {
        id
        status
        dueDate
      }
    }
  }
`;

export const RESCHEDULE_FOLLOW_UP_MUTATION = gql`
  mutation RescheduleClientFollowUp($input: RescheduleClientFollowUpInput!) {
    rescheduleClientFollowUp(input: $input) {
      status
      message
      data {
        id
        status
        dueDate
      }
    }
  }
`;

export const COMPLETE_FOLLOW_UP_MUTATION = gql`
  mutation CompleteClientFollowUp($input: CompleteClientFollowUpInput!) {
    completeClientFollowUp(input: $input) {
      status
      message
      data {
        id
        status
        dueDate
      }
    }
  }
`;

export const CANCEL_FOLLOW_UP_MUTATION = gql`
  mutation CancelClientFollowUp($input: CancelClientFollowUpInput!) {
    cancelClientFollowUp(input: $input) {
      status
      message
      data {
        id
        status
        dueDate
      }
    }
  }
`;

/** Pessoas ativas da empresa, para o gestor escolher o responsável. */
export const FOLLOW_UP_PEOPLE_QUERY = gql`
  query FollowUpPeople($input: BaseListInput!) {
    follow_up_people: users(input: $input) {
      edges {
        node {
          id
          name
          isActive
        }
      }
      totalCount
    }
  }
`;

/** Resposta comum das mutations: o agendamento, ou a recusa com a mensagem. */
export interface FollowUpMutationPayload {
  status: boolean;
  message: string;
  data: { id: string; status: string; dueDate: string } | null;
}
