import { ColumnChoice } from "@/utils/import/columns";

/** Colunas mapeadas do arquivo de pedido (SKU, quantidade, preço, IPI). */
export type Mapping = {
  sku: ColumnChoice;
  quantity: ColumnChoice;
  unitPrice: ColumnChoice;
  /** Alíquota de IPI (%) — só em fábricas com IPI no pedido; opcional. */
  ipiRate: ColumnChoice;
};

/** Item já estruturado por uma receita (quando a fábrica tem modelo de pedido). */
export interface ExtractedItem {
  sku: string;
  name: string | null;
  quantity: string;
  unitPrice: string | null;
  /** Alíquota de IPI do item (%), quando o pedido traz a coluna; null se não houver. */
  ipiRate: string | null;
}

export interface ExtractOrderFileResponse {
  extractOrderFile: {
    status: boolean;
    message: string;
    data: {
      fileType: string;
      rows: string[][];
      items: ExtractedItem[] | null;
      /** Linhas com cara de item que o backend não conseguiu ler (PDF). */
      unreadableRows: string[] | null;
    } | null;
  };
}

export interface TierOption {
  tierId: string;
  tierName: string | null;
  unitPrice: string;
}

export interface ImportCandidate {
  rowIndex: number;
  rawSku: string;
  rawName: string | null;
  quantity: string;
  matched: boolean;
  productId: string | null;
  productName: string | null;
  tierId: string | null;
  tierName: string | null;
  unitPrice: string;
  confidence: string;
  message: string | null;
  tierOptions: TierOption[];
}

export interface PreviewOrderImportResponse {
  previewOrderImport: {
    status: boolean;
    message: string;
    data: {
      matchedCount: number;
      unmatchedCount: number;
      candidates: ImportCandidate[];
    } | null;
  };
}

export interface ImportResult {
  created: number;
  failed: number;
  errors: { index: number; sku: string | null; message: string }[];
}

export interface ConfirmOrderImportResponse {
  confirmOrderImport: {
    status: boolean;
    message: string;
    data: ImportResult | null;
  };
}

/** Item extraído do arquivo que NÃO pôde ser importado (sem produto/nível no catálogo). */
export interface SkippedImportItem {
  sku: string;
  name: string | null;
  reason: string;
}

/** Linha da revisão: candidato do backend + estado editável de inclusão/nível/qtd/preço/IPI. */
export interface ReviewRow {
  candidate: ImportCandidate;
  include: boolean;
  tierId: string | null;
  quantity: string;
  unitPrice: string;
  /** Alíquota de IPI (%) do item; "" quando a fábrica não cobra IPI no pedido. */
  ipiRate: string;
}
