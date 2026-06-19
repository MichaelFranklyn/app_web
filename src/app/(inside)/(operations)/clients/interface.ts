export interface ClientsStats {
  clientStats: {
    totalClients: number;
    activeClients: number;
    atRiskClients: number;
    noVisit30d: number;
  };
}

export interface ClientsContentProps {
  stats: ClientsStats;
}
