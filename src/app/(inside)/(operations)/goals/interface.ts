/** Uma linha do acompanhamento: a meta do mês (quando existe) e o realizado. */
export interface GoalRow {
  /** Nulo = o vendedor movimentou a fábrica no mês, mas ninguém definiu meta. */
  goalId: string | null;
  sellerId: string;
  factoryId: string;
  periodMonth: string;
  seller: { id: string; name: string } | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    nickname: string | null;
    razaoSocial: string;
  } | null;
  targetInvoicedAmount: string | null;
  targetOrderedAmount: string | null;
  targetPositivations: number | null;
  targetVisits: number | null;
  invoicedAmount: string;
  orderedAmount: string;
  positivations: number;
  visits: number;
}

export interface SellerGoalsResponse {
  sellerGoals: {
    periodMonth: string;
    rows: GoalRow[];
  };
}

export interface GoalsSellersResponse {
  goals_sellers: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
  };
}

export interface GoalsFactoriesResponse {
  goals_factories: {
    edges: {
      node: {
        id: string;
        factoryId: string;
        nickname: string | null;
        factory: {
          id: string;
          nomeFantasia: string | null;
          razaoSocial: string;
        } | null;
      };
    }[];
  };
}
