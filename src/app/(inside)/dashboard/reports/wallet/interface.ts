/** Situação do cliente — o enum `ClientWalletSituation` do schema. */
export type WalletSituation =
  | "ACTIVE"
  | "AT_RISK"
  | "INACTIVE"
  | "NEW"
  | "NEVER";

/** Um cliente da carteira e a situação em que ele está hoje. */
export interface WalletRow {
  clientId: string;
  /** Chave da rota /clients/[id] — é o vínculo, não o cliente global. */
  companyClientId: string | null;
  clientName: string;
  city: string | null;
  state: string | null;
  situation: WalletSituation;
  lastOrderDate: string | null;
  daysSinceLastOrder: number | null;
  /** Nulo com menos de 2 pedidos: sem segundo pedido não há ritmo próprio. */
  avgIntervalDays: number | null;
  riskRatio: number | null;
  orderCount: number;
  periodOrderCount: number;
  periodAmount: string;
}

export interface WalletReport {
  rows: WalletRow[];
  totalClients: number;
  activeClients: number;
  atRiskClients: number;
  inactiveClients: number;
  neverBoughtClients: number;
  newClients: number;
  periodAmount: string;
}

export interface WalletReportResponse {
  walletStatusReport: WalletReport;
}

/** Recorte local da aba: qual situação está à vista. */
export type WalletScope = "all" | WalletSituation;
