import { gql } from "@apollo/client";

const BATCH_FIELDS = `
  id
  factoryId
  factoryName
  sellerId
  defaultStatus
  createdAt
  totalFiles
  pendingFiles
  readFiles
  failedFiles
  importedFiles
`;

const FILE_FIELDS = `
  id
  fileName
  size
  status
  isStale
  header
  items
  unreadableRows
  error
  createdAt
  readAt
  clientId
  clientName
  clientDocument
  clientMatchedBy
  suggestedSellerId
`;

export const ORDER_PDF_IMPORT_BATCH_QUERY = gql`
  query OrderPdfImportBatch($id: UUID!) {
    orderPdfImportBatch(id: $id) {
      status
      message
      data {
        ${BATCH_FIELDS}
        files {
          ${FILE_FIELDS}
        }
      }
    }
  }
`;

export const ORDER_PDF_IMPORT_BATCHES_QUERY = gql`
  query OrderPdfImportBatches {
    orderPdfImportBatches {
      status
      message
      data {
        ${BATCH_FIELDS}
      }
    }
  }
`;

export const CREATE_ORDER_PDF_IMPORT_BATCH_MUTATION = gql`
  mutation CreateOrderPdfImportBatch($input: CreateOrderPdfImportBatchInput!) {
    createOrderPdfImportBatch(input: $input) {
      status
      message
      data {
        ${BATCH_FIELDS}
      }
    }
  }
`;

export const ADD_ORDER_PDF_IMPORT_FILE_MUTATION = gql`
  mutation AddOrderPdfImportFile($input: AddOrderPdfImportFileInput!) {
    addOrderPdfImportFile(input: $input) {
      status
      message
      data {
        ticket
        uploadUrlPath
        duplicate
        file {
          ${FILE_FIELDS}
        }
      }
    }
  }
`;

export const MARK_ORDER_PDF_IMPORT_FILES_IMPORTED_MUTATION = gql`
  mutation MarkOrderPdfImportFilesImported(
    $batchId: UUID!
    $fileIds: [UUID!]!
    $historyBatchId: UUID
  ) {
    markOrderPdfImportFilesImported(
      batchId: $batchId
      fileIds: $fileIds
      historyBatchId: $historyBatchId
    ) {
      status
      message
      data {
        marked
      }
    }
  }
`;

/** Troca a fábrica enquanto nada do lote virou pedido; os lidos são relidos. */
export const CHANGE_ORDER_PDF_IMPORT_BATCH_FACTORY_MUTATION = gql`
  mutation ChangeOrderPdfImportBatchFactory($id: UUID!, $factoryId: UUID!) {
    changeOrderPdfImportBatchFactory(id: $id, factoryId: $factoryId) {
      status
      message
      data {
        ${BATCH_FIELDS}
        files {
          ${FILE_FIELDS}
        }
      }
    }
  }
`;

/** Exclui o lote e os PDFs dele; os pedidos já importados ficam. */
export const DELETE_ORDER_PDF_IMPORT_BATCH_MUTATION = gql`
  mutation DeleteOrderPdfImportBatch($id: UUID!) {
    deleteOrderPdfImportBatch(id: $id) {
      status
      message
    }
  }
`;

export const DELETE_ORDER_PDF_IMPORT_FILE_MUTATION = gql`
  mutation DeleteOrderPdfImportFile($batchId: UUID!, $fileId: UUID!) {
    deleteOrderPdfImportFile(batchId: $batchId, fileId: $fileId) {
      status
      message
    }
  }
`;
