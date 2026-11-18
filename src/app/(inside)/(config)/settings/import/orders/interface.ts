import { ColumnChoice } from "@/utils/import/columns";

export type HistoryFieldKey =
  | "externalRef"
  | "orderDate"
  | "clientDocument"
  | "clientName"
  | "factory"
  | "seller"
  | "status"
  | "productCode"
  | "productName"
  | "quantity"
  | "unitPrice"
  | "total"
  | "invoiceNumber"
  | "invoicedAt"
  | "paymentTerms";

export type HistoryMapping = Record<HistoryFieldKey, ColumnChoice>;

export interface HistoryField {
  key: HistoryFieldKey;
  label: string;
  required: boolean;
  help: string;
  /** Títulos de coluna que já indicam o campo (sem acento, minúsculo). */
  guesses: string[];
}
