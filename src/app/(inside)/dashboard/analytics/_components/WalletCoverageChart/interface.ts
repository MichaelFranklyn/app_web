export interface WalletCoveragePoint {
  entityId: string;
  entityName: string;
  walletClients: number;
  activeClients: number;
  coverageRate: number;
}

export interface WalletCoverageResponse {
  walletCoverageBySeller: WalletCoveragePoint[];
}
