/** Uma coluna da matriz: uma fábrica com vínculo em alguém da carteira. */
export interface PositivationFactory {
  factoryId: string;
  factoryName: string;
  linkedClients: number;
  positivatedClients: number;
  positivationRate: number;
  totalAmount: string;
}

/**
 * Uma célula. `isLinked: false` é o cliente sem vínculo naquela fábrica — a
 * célula existe para as colunas não escorregarem de posição na linha.
 */
export interface PositivationCell {
  factoryId: string;
  factoryName: string;
  isLinked: boolean;
  isPositivated: boolean;
  orderCount: number;
  totalAmount: string;
  lastOrderDate: string | null;
}

/** Uma linha: um cliente da carteira e o que ele comprou de cada fábrica. */
export interface PositivationRow {
  clientId: string;
  /** Id na carteira — a chave da rota /clients/[id]. Nulo se o vínculo saiu. */
  companyClientId: string | null;
  clientName: string;
  sellerId: string;
  sellerName: string;
  linkedFactories: number;
  positivatedFactories: number;
  orderCount: number;
  totalAmount: string;
  lastOrderDate: string | null;
  cells: PositivationCell[];
}

export interface PositivationReport {
  walletClients: number;
  positivatedClients: number;
  clientPositivationRate: number;
  linkedPairs: number;
  positivatedPairs: number;
  pairPositivationRate: number;
  totalAmount: string;
  factories: PositivationFactory[];
  rows: PositivationRow[];
}

export interface PositivationReportResponse {
  positivationReport: PositivationReport;
}

/** Recorte da tabela: todo mundo, só quem comprou, ou só quem ficou zerado. */
export type PositivationScope = "all" | "positivated" | "zeroed";
