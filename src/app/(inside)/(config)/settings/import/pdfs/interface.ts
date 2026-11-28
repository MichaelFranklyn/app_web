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
  /** Os totais do rodapé do PDF, em texto ("1578.00"), quando ele imprime. */
  totals?: PdfPrintedTotals | null;
}

/** O rodapé do pedido: itens sem imposto, IPI, ST e o total com tudo. */
export interface PdfPrintedTotals {
  items: string | null;
  ipi: string | null;
  st: string | null;
  total: string | null;
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
  /**
   * A condição que a pessoa costuma pôr no lugar da lida, nos PDFs desta
   * fábrica — vem já aplicada, e ela desfaz com um clique.
   */
  suggestedPaymentTerms?: string | null;
  /** O cliente da carteira que a pessoa costuma apontar para este nome lido. */
  suggestedClient?: PdfSuggestedClient | null;
}

export interface PdfSuggestedClient {
  id: string;
  name: string;
  document: string;
}

/** Enum `OrderPdfImportCorrectionField` do backend, pelo NOME. */
export type PdfCorrectionField = "PAYMENT_TERMS" | "CLIENT";

/** O que a pessoa deixou num campo do PDF ao importar — a leitura aprende. */
export interface PdfCorrection {
  fileId: string;
  field: PdfCorrectionField;
  value: string | null;
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

export interface ChangePdfImportBatchFactoryResponse {
  changeOrderPdfImportBatchFactory: Payload<PdfImportBatch>;
}

export interface DeletePdfImportBatchResponse {
  deleteOrderPdfImportBatch: { status: boolean; message: string };
}

export interface DeletePdfImportFileResponse {
  deleteOrderPdfImportFile: { status: boolean; message: string };
}

/**
 * Vendedor e situação para todos os PDFs do lote, escolhidos depois da leitura
 * (cada PDF ainda pode trocar os seus). Nulo = o vendedor de cada cliente.
 */
export interface PdfDefaults {
  sellerId: string | null;
  status: HistoryOrderStatus;
}

/** O que a pessoa acertou num PDF antes de importar. */
/** Como apontar o cliente do PDF sem CNPJ: da carteira ou CNPJ digitado. */
export type PdfClientMode = "wallet" | "typed";

export interface PdfFileOverride {
  /** ISO; quando o PDF não trouxe a data (ou trouxe errada). */
  orderDate?: string | null;
  /** O vendedor deste PDF, no lugar do padrão escolhido para todos. */
  sellerId?: string | null;
  /**
   * A condição de pagamento digitada, no lugar da lida do PDF (que pode ter
   * vindo errada ou faltado). `null` = apagada: o pedido vai sem condição.
   */
  paymentTerms?: string | null;
  /** A situação deste pedido, no lugar do padrão escolhido para todos. */
  status?: HistoryOrderStatus;
  /**
   * Sem CNPJ nem código que case, como a pessoa aponta o cliente: buscando na
   * carteira ou digitando o CNPJ. `undefined` = carteira (o padrão).
   */
  clientMode?: PdfClientMode;
  /** O cliente escolhido na carteira (modo `wallet`). */
  clientId?: string | null;
  /** O nome do cliente escolhido na carteira, para a busca exibi-lo. */
  clientName?: string | null;
  /**
   * O CNPJ do cliente (só dígitos): o do escolhido na carteira ou o digitado.
   * Digitado e fora da carteira, o cliente é cadastrado na importação com os
   * dados da Receita.
   */
  clientDocument?: string | null;
  /**
   * O código do cliente na fábrica, digitado junto com o CNPJ; `undefined` =
   * o lido do PDF. Gravado no vínculo, faz o próximo PDF achar o cliente sozinho.
   */
  clientCode?: string | null;
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
