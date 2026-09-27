export type NfeImportStatus =
  | "READY"
  | "NEEDS_REVIEW"
  | "ALREADY_IMPORTED"
  | "NOT_AUTHORIZED"
  | "UNKNOWN_FACTORY"
  | "UNKNOWN_CLIENT"
  | "NO_OPEN_ORDER"
  | "INVALID";

export interface NfePreviewRow {
  fileName: string;
  status: NfeImportStatus;
  reasons: string[];
  orderId: string | null;
  orderTotal: string | null;
  invoiceNumber: string | null;
  issuedAt: string | null;
  emitterName: string | null;
  recipientName: string | null;
  netProductsTotal: string | null;
  invoiceTotal: string | null;
  installments: { number: string | null; dueDate: string; amount: string }[];
  /** As parcelas vão seguir os boletos da nota (senão, o prazo do pedido). */
  usesInvoiceBills: boolean;
  /** De onde saem as parcelas, por extenso. */
  billsNote: string | null;
}

export interface PreviewNfeImportResponse {
  previewNfeImport: NfePreviewRow[];
}

export interface InvoiceOrdersFromNfeResponse {
  invoiceOrdersFromNfe: {
    fileName: string;
    orderId: string | null;
    isInvoiced: boolean;
    message: string;
  }[];
}

/** Um arquivo lido no navegador, pronto para ir ao backend. */
export interface NfeFile {
  fileName: string;
  contentBase64: string;
}
