export type ProductPurchaseStatus =
  | "ON_TRACK"
  | "DUE"
  | "LATE"
  | "STOPPED"
  | "SINGLE";

export interface ClientProductAnalysisRow {
  productId: string;
  factoryId: string;
  orderCount: number;
  /** Pedidos do cliente naquela fábrica — o denominador de "8 de 10". */
  factoryOrderCount: number;
  firstPurchaseDate: string;
  lastPurchaseDate: string;
  daysSinceLast: number;
  totalUnits: string;
  avgUnits: string;
  lastUnits: string;
  totalAmount: string;
  avgIntervalDays: number | null;
  expectedNextDate: string | null;
  overdueDays: number | null;
  status: ProductPurchaseStatus;
  product: { id: string; name: string; sku: string } | null;
  factory: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    nickname: string | null;
  } | null;
}

export interface ClientProductAnalysisQueryResponse {
  clientProductAnalysis: ClientProductAnalysisRow[];
}

/** Contagem por situação — os números do topo da aba. */
export interface ProductAnalysisSummaryData {
  total: number;
  stopped: number;
  late: number;
  due: number;
  always: number;
}
