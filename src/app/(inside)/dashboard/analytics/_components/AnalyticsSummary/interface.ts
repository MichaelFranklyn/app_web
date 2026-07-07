// `totalAmount` e `avgTicket` são Decimal (chegam como string do backend).
export interface DashboardSummary {
  totalOrders: number;
  totalAmount: string;
  avgTicket: string;
  activeClients: number;
}

export interface DashboardSummaryResponse {
  dashboardSummary: DashboardSummary;
}
