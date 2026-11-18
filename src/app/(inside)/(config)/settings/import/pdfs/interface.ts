import { HistoryOrderStatus, HistoryRowInput, RowProblem } from "../interface";

/** Enum `OrderPdfImportFileStatus` do backend, pelo NOME. */
export type PdfFileStatus = "PENDING" | "READ" | "FAILED" | "IMPORTED";

/** O cabeçalho lido do PDF (JSON do backend). */
export interface PdfOrderHeader {
  clientDocument: string | null;
  clientName: string | null;
  /** ISO (AAAA-MM-DD). */
  orderDate: string | null;
  orderNumber: string | null;
  invoiceNumber: string | null;
  paymentTerms: string | null;
  otherDocuments?: string[] | null;
  /** O código que a fábrica dá ao cliente ("23401"), quando o PDF traz. */
  clientCode?: string | null;
  /** O texto das observações do pedido. */
  notes?: string | null;
  /** Prazo citado nas observações, só quando diverge da condição. */
  notesPaymentTerms?: string | null;
}

/** Um item lido; os números vêm como texto para não perder casas. */
export interface PdfOrderItem {
  code: string | null;
  name: string | null;
  quantity: string;
  unitPrice: string | null;
  ipiRate: string | null;
}

export interface PdfImportFile {
  id: string;
  fileName: string;
  size: number;
  status: PdfFileStatus;
  isStale: boolean;
  header: PdfOrderHeader | null;
  items: PdfOrderItem[] | null;
  unreadableRows: number;
  error: string | null;
  createdAt: string;
  readAt: string | null;
  clientId: string | null;
  clientName: string | null;
  /** O CNPJ do PDF ou, achado pelo código, o do cadastro. */
  clientDocument?: string | null;
  /** Por onde o cliente foi achado. */
  clientMatchedBy?: "DOCUMENT" | "FACTORY_CODE" | null;
  suggestedSellerId: string | null;
}

export interface PdfImportBatch {
  id: string;
  factoryId: string;
  factoryName: string;
  /** Nulo = o vendedor vinculado a cada cliente. */
  sellerId: string | null;
  defaultStatus: HistoryOrderStatus;
  createdAt: string;
  totalFiles: number;
  pendingFiles: number;
  readFiles: number;
  failedFiles: number;
  importedFiles: number;
  files?: PdfImportFile[] | null;
}

interface Payload<T> {
  status: boolean;
  message: string;
  data: T | null;
}

export interface PdfImportBatchResponse {
  orderPdfImportBatch: Payload<PdfImportBatch>;
}

export interface PdfImportBatchesResponse {
  orderPdfImportBatches: Payload<PdfImportBatch[]>;
}

export interface CreatePdfImportBatchResponse {
  createOrderPdfImportBatch: Payload<PdfImportBatch>;
}

export interface AddPdfImportFileResponse {
  addOrderPdfImportFile: Payload<{
    ticket: string | null;
    uploadUrlPath: string;
    duplicate: boolean;
    file: PdfImportFile;
  }>;
}

export interface MarkPdfImportFilesResponse {
  markOrderPdfImportFilesImported: Payload<{ marked: number }>;
}

/** O que a pessoa acertou num PDF antes de importar. */
export interface PdfFileOverride {
  /** Fica de fora da importação. */
  skip?: boolean;
  /** ISO; quando o PDF não trouxe a data (ou trouxe errada). */
  orderDate?: string | null;
  /** Quando o lote é "o vendedor de cada cliente" e o cliente não tem um. */
  sellerId?: string | null;
}

/** As linhas do `importOrderHistory` montadas a partir dos PDFs lidos. */
export interface PdfRowsBuild {
  rows: HistoryRowInput[];
  problems: RowProblem[];
  /** Linha → "pedido.pdf, item 3", para o resumo apontar a origem. */
  labels: Record<number, string>;
  /** Os PDFs que entraram com ao menos um item. */
  fileIds: string[];
  /** PDF → as linhas dos itens dele. */
  fileRows: Record<string, number[]>;
}

/** Um PDF a caminho do servidor. */
export interface PdfUploadState {
  key: string;
  fileName: string;
  phase: "queued" | "sending" | "done" | "error";
  error?: string;
}
