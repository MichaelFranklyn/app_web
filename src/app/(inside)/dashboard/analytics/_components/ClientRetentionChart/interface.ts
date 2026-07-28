export interface RetentionPoint {
  month: string;
  activeClients: number;
  retainedClients: number;
  retentionRate: number;
}

export interface ClientRetentionResponse {
  clientRetentionByMonth: RetentionPoint[];
}
