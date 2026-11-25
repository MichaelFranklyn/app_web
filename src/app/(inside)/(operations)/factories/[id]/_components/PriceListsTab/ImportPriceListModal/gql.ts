import { gql } from "@apollo/client";

export { fileToBase64 } from "@/utils/file";

export const PRODUCT_UNITS_QUERY = gql`
  query ImportPLUnits($input: BaseListInput!) {
    productUnits(input: $input) {
      edges {
        node {
          id
          label
        }
      }
      totalCount
    }
  }
`;

export const PRODUCT_UNIT_LABELS_QUERY = gql`
  query ImportPLUnitLabels($input: BaseListInput!) {
    productUnitLabels(input: $input) {
      edges {
        node {
          id
          label
        }
      }
      totalCount
    }
  }
`;

/** Extrai a grade de um PDF de tabela de preço no backend (pdfplumber). */
export const EXTRACT_PRICE_LIST_FILE_MUTATION = gql`
  mutation ExtractPriceListFile($input: ExtractPriceListFileInput!) {
    extractPriceListFile(input: $input) {
      status
      message
      data {
        fileType
        rows
        unreadableRows
      }
    }
  }
`;

/**
 * Põe a importação na fila do backend e devolve o id para acompanhar. A tabela
 * grande levava minutos dentro de uma requisição só, e a queda da conexão
 * escondia que o servidor tinha gravado (o reenvio criava a segunda tabela).
 */
export const START_PRICE_LIST_IMPORT_MUTATION = gql`
  mutation StartFactoryPriceListImport($input: ImportFactoryPriceListInput!) {
    startFactoryPriceListImport(input: $input) {
      status
      message
      data {
        id
        status
        isStale
      }
    }
  }
`;

/** Situação da importação na fila — a tela pergunta até ela terminar. */
export const PRICE_LIST_IMPORT_QUERY = gql`
  query PriceListImport($id: UUID!) {
    priceListImport(id: $id) {
      status
      message
      data {
        id
        status
        isStale
        message
        error
        result {
          listName
          totalRows
          tiers
          productsCreated
          productsReused
          pricesSet
          failed
          attention
          errors {
            row
            sku
            message
          }
        }
      }
    }
  }
`;
