export interface ClientRiskPoint {
  entityId: string;
  entityName: string;
  lastOrderDate: string;
  daysSinceLastOrder: number;
  avgIntervalDays: number;
  /** Dias parado ÷ intervalo médio do próprio cliente. Acima de 1 = atrasado. */
  riskRatio: number;
  orderCount: number;
}

export interface ClientsAtRiskResponse {
  clientsAtRisk: ClientRiskPoint[];
}
