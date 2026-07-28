// Fonte única: o enum de resultado ganhou os valores exclusivos do contato remoto.
import type { VisitContactType, VisitOutcome } from "@/utils/visit";

export type { VisitContactType, VisitOutcome };

import { ScoreDimensions } from "@/utils/score";

export interface CompanyClientLink {
  id: string;
  notes: string | null;
  isActive: boolean;
}

export interface ClientDetail {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnae: string;
  cnaeDescription: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressComplement: string | null;
  addressNeighborhood: string | null;
  addressZip: string | null;
  addressCity: string | null;
  addressState: string | null;
  createdAt: string;
  updatedAt: string;
  companyClient: CompanyClientLink | null;
}

export interface ClientDetailQueryResponse {
  client: {
    status: boolean;
    code: number;
    message: string;
    data: ClientDetail | null;
  };
}

// Score mais recente de um vínculo, com a fábrica de onde ele veio. Um cliente
// tem um score por fábrica; o header mostra o mais alto e a aba mostra todos.
export interface FactoryVisitScore extends ScoreDimensions {
  scoreDate: string;
  clientFactoryLink: {
    id: string;
    factory: { id: string; nomeFantasia: string | null } | null;
  } | null;
}

// Resposta de companyClient(id): a rota de detalhe é chaveada pelo id da carteira
// (company_client), então resolvemos o vínculo e lemos o cliente global aninhado.
export interface CompanyClientDetail {
  id: string;
  notes: string | null;
  isActive: boolean;
  topVisitScore: ScoreDimensions | null;
  factoryVisitScores: FactoryVisitScore[];
  client: ClientDetail | null;
}

export interface CompanyClientDetailQueryResponse {
  companyClient: {
    status: boolean;
    code: number;
    message: string;
    data: CompanyClientDetail | null;
  };
}

export interface ClientFactoryScoresQueryResponse {
  companyClient: {
    data: { id: string; factoryVisitScores: FactoryVisitScore[] } | null;
  };
}

export interface UpdateClientInput {
  razaoSocial?: string;
  nomeFantasia?: string;
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressZip?: string;
  addressCity?: string;
  addressState?: string;
}

export interface SellerClientFactory {
  id: string;
  priority: string | null;
  visitFrequencyDays: number | null;
  lastVisitDate: string | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
  seller: { id: string; name: string } | null;
}

export interface SellerClientFactoriesQueryResponse {
  sellerClientFactoryList: {
    edges: { node: SellerClientFactory }[];
    totalCount: number;
  };
}

export interface ClientOrder {
  id: string;
  orderDate: string;
  totalAmount: string;
  status: string;
  notes: string | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
  seller: { id: string; name: string } | null;
}

export interface ClientOrdersQueryResponse {
  orders: {
    edges: { node: ClientOrder }[];
    totalCount: number;
  };
}

// Resumo dos pedidos do cliente em uma fábrica. `totalOrders: 0` é informação de
// venda: o cliente tem a fábrica vinculada e nunca comprou dela.
export interface FactoryOrderSummary {
  sellerClientFactoryId: string;
  sellerId: string;
  totalOrders: number;
  totalAmount: string;
  lastOrderDate: string | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
}

export interface ClientFactoryOrdersQueryResponse {
  companyClient: {
    data: { id: string; factoryOrderSummaries: FactoryOrderSummary[] } | null;
  };
}

export interface VisitScore {
  id: string;
  scoreDate: string;
  scoreTotal: string;
  scoreUrgency: string;
  scorePriority: string;
  scoreFrequency: string;
  scorePotential: string;
  scoreRecency: string;
}

export interface ClientVisitScoresQueryResponse {
  clientVisitScores: {
    edges: { node: VisitScore }[];
    totalCount: number;
  };
}

export interface ProductInsight {
  id: string;
  lastPurchaseDate: string | null;
  lastQuantity: string;
  avgQuantity: string;
  avgShelfDays: number | null;
  avgIntervalDays: number | null;
  estimatedStockoutDate: string | null;
  daysSinceStockout: number;
  nextPurchaseEstimate: string | null;
  churnRisk: "baixo" | "medio" | "alto";
  product: { id: string; name: string; unit: { label: string } | null } | null;
}

export interface ClientProductInsightsQueryResponse {
  clientProductInsights: {
    edges: { node: ProductInsight }[];
    totalCount: number;
  };
}

// Observação de estoque avulsa (fora de uma visita): o vendedor liga, o cliente
// diz quantos dias ainda dura, e isso corrige a previsão de esgotamento na hora.
export interface UpdateProductStockResponse {
  updateProductStock: {
    status: boolean;
    code: number;
    message: string;
    data: {
      id: string;
      productId: string;
      daysRemaining: number | null;
      observation: string;
    } | null;
  };
}

export type VisitStatus =
  | "PENDING"
  | "COMPLETED"
  | "CLIENT_ABSENT"
  | "NO_TIME"
  | "RESCHEDULED"
  | "CANCELLED";

// Fábrica tratada numa visita. Uma ida ao cliente cobre as fábricas urgentes.
export interface VisitFocusFactory {
  scoreTotal: string | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
}

export interface ClientVisit {
  id: string;
  /** Visita presencial ou contato remoto — o histórico mistura os dois. */
  contactType: VisitContactType;
  status: VisitStatus;
  outcome: VisitOutcome | null;
  outcomeReason: string | null;
  actualVisitAt: string | null;
  notes: string | null;
  /** O que motivou a visita (sugestão do sistema). */
  focusFactories: VisitFocusFactory[];
  /** O que o vendedor de fato tratou, derivado das observações de estoque. */
  treatedFactories: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  }[];
  day: {
    id: string;
    date: string;
    schedule: {
      id: string;
      seller: { id: string; name: string } | null;
    } | null;
  } | null;
  clientFactoryLink: {
    id: string;
    client: {
      id: string;
      nomeFantasia: string | null;
      razaoSocial: string;
    } | null;
    factory: {
      id: string;
      nomeFantasia: string | null;
      razaoSocial: string;
    } | null;
  } | null;
}

export interface ClientVisitsQueryResponse {
  visitsByCompanyClient: {
    edges: { node: ClientVisit }[];
    totalCount: number;
  };
}

export interface FactoryStockSummary {
  sellerClientFactoryId: string;
  totalProducts: number;
  stockedOut: number;
  critical: number;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
}

export interface ClientFactoryStockQueryResponse {
  companyClient: {
    data: { id: string; factoryStockSummaries: FactoryStockSummary[] } | null;
  };
}

export interface UpdateClientNotesInput {
  notes: string;
}

export interface UpdateClientNotesResponse {
  updateClientNotes: {
    status: boolean;
    code: number;
    message: string;
    data: CompanyClientLink | null;
  };
}

export interface CreateSellerClientFactoryInput {
  clientId: string;
  sellerId: string;
  factoryId: string;
  priceTierId: string;
  priority?: string;
  visitFrequencyDays?: number;
}

export interface UpdateSellerClientFactoryInput {
  priceTierId?: string;
  priority?: string;
  visitFrequencyDays?: number;
}

export interface CreateSellerClientFactoryResponse {
  createSellerClientFactory: {
    status: boolean;
    code: number;
    message: string;
    data: SellerClientFactory | null;
  };
}

export interface UpdateSellerClientFactoryResponse {
  updateSellerClientFactory: {
    status: boolean;
    code: number;
    message: string;
    data: SellerClientFactory | null;
  };
}

export interface UpdateAddressInput {
  addressStreet?: string;
  addressNumber?: string;
  addressComplement?: string;
  addressNeighborhood?: string;
  addressZip?: string;
  addressCity?: string;
  addressState?: string;
}

export interface UpdateAddressResponse {
  updateClientAddress: {
    status: boolean;
    code: number;
    message: string;
    data: ClientDetail | null;
  };
}
