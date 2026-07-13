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
  initialData: QueryData;
}

export interface Client {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnae: string;
  cnaeDescription: string | null;
  addressCity: string | null;
  addressState: string | null;
  // Vínculo com a empresa logada: o id da carteira é o que chaveia a rota de
  // detalhe (/clients/[companyClientId]), pois o mesmo cliente global pode
  // pertencer a outras empresas e as abas são company-scoped.
  companyClient: { id: string; visitScoreTotal: string | null } | null;
}

export interface ClientsQueryResponse {
  clients_list: {
    edges: { node: Client }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface QueryData {
  clients_list: ClientsQueryResponse["clients_list"];
}
