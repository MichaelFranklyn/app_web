import { gql } from "@apollo/client";

/** Extrai a grade de células de um PDF no backend (pdfplumber). Excel/CSV são lidos no browser. */
export const EXTRACT_ORDER_FILE_MUTATION = gql`
  mutation ExtractOrderFile($input: ExtractOrderFileInput!) {
    extractOrderFile(input: $input) {
      status
      message
      data {
        fileType
        rows
        items {
          sku
          name
          quantity
          unitPrice
        }
      }
    }
  }
`;

/** Casa SKU→produto/nível/preço na(s) tabela(s) ativa(s) da fábrica do pedido. Não grava nada. */
export const PREVIEW_ORDER_IMPORT_MUTATION = gql`
  mutation PreviewOrderImport($input: PreviewOrderImportInput!) {
    previewOrderImport(input: $input) {
      status
      message
      data {
        matchedCount
        unmatchedCount
        candidates {
          rowIndex
          rawSku
          rawName
          quantity
          matched
          productId
          productName
          tierId
          tierName
          unitPrice
          confidence
          message
          tierOptions {
            tierId
            tierName
            unitPrice
          }
        }
      }
    }
  }
`;

/** Grava os itens revisados no pedido (source FILE_IMPORT) e recalcula os totais. */
export const CONFIRM_ORDER_IMPORT_MUTATION = gql`
  mutation ConfirmOrderImport($input: ConfirmOrderImportInput!) {
    confirmOrderImport(input: $input) {
      status
      message
      data {
        created
        failed
        errors {
          index
          sku
          message
        }
      }
    }
  }
`;
