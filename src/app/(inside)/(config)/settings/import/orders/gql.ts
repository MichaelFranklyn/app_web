import { gql } from "@apollo/client";

export const IMPORT_ORDER_HISTORY_MUTATION = gql`
  mutation ImportOrderHistory($input: ImportOrderHistoryInput!) {
    importOrderHistory(input: $input) {
      status
      message
      data {
        dryRun
        batchId
        totalRows
        ordersCreated
        ordersAlreadyImported
        ordersSkipped
        itemsImported
        itemsSkipped
        linksCreated
        issues {
          row
          message
        }
        missingProducts {
          factoryId
          factory {
            id
            nomeFantasia
            razaoSocial
            nickname
          }
          code
          name
          rows
        }
        missingClients {
          document
          rows
        }
      }
    }
  }
`;

export const HISTORY_FACTORIES_QUERY = gql`
  query HistoryImportFactories($input: BaseListInput!) {
    companyFactories(input: $input) {
      edges {
        node {
          id
          factoryId
          nickname
          factory {
            id
            nomeFantasia
            razaoSocial
          }
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

export const HISTORY_SELLERS_QUERY = gql`
  query HistoryImportSellers($input: BaseListInput!) {
    sellers(input: $input) {
      edges {
        node {
          id
          name
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

/** Importações já feitas, mais recentes primeiro (só o gestor). */
export const HISTORY_IMPORT_BATCHES_QUERY = gql`
  query OrderHistoryImportBatches {
    orderHistoryImportBatches {
      id
      createdAt
      createdByEmail
      ordersCount
      itemsCount
      undoneAt
      undoneByEmail
      undoReason
      ordersUndone
    }
  }
`;

export const UNDO_HISTORY_IMPORT_MUTATION = gql`
  mutation UndoOrderHistoryImport($id: UUID!, $input: ReasonInput!) {
    undoOrderHistoryImport(id: $id, input: $input) {
      status
      message
      data {
        id
        undoneAt
        undoneByEmail
        undoReason
        ordersUndone
      }
    }
  }
`;
