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

export const IMPORT_PRICE_LIST_MUTATION = gql`
  mutation ImportFactoryPriceList($input: ImportFactoryPriceListInput!) {
    importFactoryPriceList(input: $input) {
      status
      message
      data {
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
`;
