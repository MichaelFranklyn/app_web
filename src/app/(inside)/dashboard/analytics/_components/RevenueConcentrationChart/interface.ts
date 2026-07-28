export interface RevenueSharePoint {
  /** Nulo na linha agregada "Outros clientes". */
  entityId: string | null;
  entityName: string;
  total: string;
  share: number;
  cumulativeShare: number;
}

export interface RevenueConcentrationResponse {
  revenueConcentrationByClient: RevenueSharePoint[];
}
