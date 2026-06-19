import { gql } from "@apollo/client";

/** Lê um arquivo (File) e devolve só o conteúdo base64 (sem o prefixo data URL). */
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",", 2)[1] ?? "");
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o arquivo."));
    reader.readAsDataURL(file);
  });

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
