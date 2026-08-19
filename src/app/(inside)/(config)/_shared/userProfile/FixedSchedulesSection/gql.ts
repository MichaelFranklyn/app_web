import { gql } from "@apollo/client";

/**
 * `nextOccurrences` vem do backend porque a aritmética da recorrência é dele:
 * a série é ancorada em `startsOn` e nada a desloca. Recalcular no navegador
 * criaria uma segunda verdade sobre quando o vendedor vai à loja — e a que
 * aparece na tela seria justamente a que ninguém executa.
 */
const FIXED_SCHEDULE_FIELDS = gql`
  fragment FixedScheduleFields on FixedScheduleType {
    id
    clientId
    weekday
    intervalWeeks
    startsOn
    endsOn
    isActive
    notes
    nextOccurrences(limit: 3)
    client {
      id
      razaoSocial
      nomeFantasia
    }
  }
`;

export const FIXED_SCHEDULES_QUERY = gql`
  query FixedSchedules($input: BaseListInput!, $sellerId: UUID) {
    fixedSchedules(input: $input, sellerId: $sellerId) {
      edges {
        node {
          ...FixedScheduleFields
        }
      }
      totalCount
    }
  }
  ${FIXED_SCHEDULE_FIELDS}
`;

export const CREATE_FIXED_SCHEDULE_MUTATION = gql`
  mutation CreateFixedSchedule($input: CreateFixedScheduleInput!) {
    createFixedSchedule(input: $input) {
      status
      message
      data {
        ...FixedScheduleFields
      }
    }
  }
  ${FIXED_SCHEDULE_FIELDS}
`;

export const UPDATE_FIXED_SCHEDULE_MUTATION = gql`
  mutation UpdateFixedSchedule($id: UUID!, $input: UpdateFixedScheduleInput!) {
    updateFixedSchedule(id: $id, input: $input) {
      status
      message
      data {
        ...FixedScheduleFields
      }
    }
  }
  ${FIXED_SCHEDULE_FIELDS}
`;

export const DELETE_FIXED_SCHEDULE_MUTATION = gql`
  mutation DeleteFixedSchedule($id: UUID!) {
    deleteFixedSchedule(id: $id) {
      status
      message
    }
  }
`;

/** Carteira do vendedor: o compromisso só existe para cliente que ele atende. */
export const WALLET_CLIENTS_QUERY = gql`
  query FixedScheduleWalletClients($input: BaseListInput!) {
    sellerClientFactoryList(input: $input) {
      edges {
        node {
          id
          clientId
          client {
            id
            razaoSocial
            nomeFantasia
          }
        }
      }
      totalCount
    }
  }
`;
