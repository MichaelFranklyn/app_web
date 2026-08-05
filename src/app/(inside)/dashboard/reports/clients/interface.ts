/** Uma linha do relatório: um cliente da carteira. */
export interface ClientReportRow {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  addressCity: string | null;
  addressState: string | null;
  isNeedsAttention: boolean;
  companyClient: {
    /** Id na carteira — a chave da rota /clients/[id]. */
    id: string;
    visitScoreTotal: string | null;
    lastOrderDate: string | null;
    lastVisitDate: string | null;
    network: { id: string; name: string } | null;
    segment: { id: string; name: string } | null;
    sellers: { id: string; name: string }[];
  } | null;
}

export interface ClientsReportResponse {
  clients_report: {
    edges: { node: ClientReportRow }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    totalCount: number;
  };
}

export interface ClientsReportStatsResponse {
  clients_report_stats: {
    totalClients: number;
    activeClients: number;
    atRiskClients: number;
    noVisit30d: number;
  };
}

export interface ClientRiskPoint {
  entityId: string;
  entityName: string;
  lastOrderDate: string;
  daysSinceLastOrder: number;
  avgIntervalDays: number;
  riskRatio: number;
  orderCount: number;
}

export interface ClientsAtRiskResponse {
  clientsAtRisk: ClientRiskPoint[];
}
