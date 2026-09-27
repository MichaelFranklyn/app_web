import { ColumnChoice } from "@/utils/import/columns";

export type HistoryFieldKey =
  | "externalRef"
  | "orderDate"
  | "clientDocument"
  | "factory"
  | "seller"
  | "productCode"
  | "productName"
  | "quantity"
  | "unitPrice"
  | "total";

export type HistoryMapping = Record<HistoryFieldKey, ColumnChoice>;

export type QuantityUnit = "UNITS" | "PACKS";

export interface HistoryField {
  key: HistoryFieldKey;
  label: string;
  required: boolean;
  help: string;
  /** Títulos de coluna que já indicam o campo (sem acento, minúsculo). */
  guesses: string[];
}

/** Uma opção para casar com o valor da planilha (fábrica, vendedor). */
export interface MatchOption {
  id: string;
  label: string;
}

/** Linha pronta para a mutation (espelha `ImportOrderHistoryRowInput`). */
export interface HistoryRowInput {
  row: number;
  externalRef: string | null;
  clientDocument: string;
  factoryId: string;
  sellerId: string;
  orderDate: string;
  productCode: string | null;
  productName: string | null;
  quantity: string;
  unitPrice: string | null;
  total: string | null;
}

export interface RowProblem {
  row: number;
  message: string;
}

export interface HistoryResult {
  dryRun: boolean;
  totalRows: number;
  ordersCreated: number;
  ordersAlreadyImported: number;
  ordersSkipped: number;
  itemsImported: number;
  itemsSkipped: number;
  linksCreated: number;
  issues: RowProblem[];
  missingProducts: {
    factoryId: string;
    factory: {
      id: string;
      nomeFantasia: string | null;
      razaoSocial: string;
      nickname: string | null;
    } | null;
    code: string | null;
    name: string | null;
    rows: number;
  }[];
  missingClients: { document: string; rows: number }[];
}

export interface ImportOrderHistoryResponse {
  importOrderHistory: {
    status: boolean;
    message: string;
    data: HistoryResult | null;
  };
}
