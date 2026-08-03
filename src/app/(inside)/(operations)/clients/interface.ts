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
  /** Gestor (owner/admin/su): pode filtrar a carteira por vendedor. */
  canFilterBySeller: boolean;
}

export interface ClientSeller {
  id: string;
  name: string;
}

export interface ClientsSellersResponse {
  clients_sellers: {
    edges: { node: ClientSeller }[];
  };
}

export interface Client {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  addressCity: string | null;
  addressState: string | null;
  // Marcação de revisão: hoje sinaliza cliente cujo endereço não virou
  // coordenada (some da rota/radar). attentionReason traz o motivo p/ o tooltip.
  isNeedsAttention: boolean;
  attentionReason: string | null;
  // Vínculo com a empresa logada: o id da carteira é o que chaveia a rota de
  // detalhe (/clients/[companyClientId]), pois o mesmo cliente global pode
  // pertencer a outras empresas e as abas são company-scoped.
  companyClient: {
    id: string;
    visitScoreTotal: string | null;
    // Últimas compra/visita e vendedores vêm do vínculo com a empresa: para um
    // vendedor logado o backend já devolve só o que é dele.
    lastOrderDate: string | null;
    // Faturamento mais recente entre os pedidos do cliente — vazio enquanto ele
    // só tiver pedido em aberto.
    lastInvoiceDate: string | null;
    lastVisitDate: string | null;
    sellers: ClientSeller[];
  } | null;
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

/** Nós dos catálogos de classificação (rede e segmento) usados nos filtros. */
export interface ClassificationData {
  clientNetworks?: { edges: { node: { id: string; name: string } }[] };
  clientSegments?: { edges: { node: { id: string; name: string } }[] };
}
