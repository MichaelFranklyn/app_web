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

export interface VisitScore {
  id: string;
  scoreDate: string;
  scoreTotal: string;
  scoreUrgency: string;
  scorePriority: string;
  scoreFrequency: string;
  scorePotential: string;
  scoreRecency: string;
  recommendedProducts: Record<string, unknown>[] | null;
  stockoutAlerts: Record<string, unknown>[] | null;
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

export type VisitStatus =
  | "PENDING"
  | "COMPLETED"
  | "CLIENT_ABSENT"
  | "NO_TIME"
  | "RESCHEDULED"
  | "CANCELLED";

export type VisitOutcome = "SOLD" | "NOT_BOUGHT" | "RESCHEDULED" | "CLOSED";

export type StockObservation = "OUT_OF_STOCK" | "LOW" | "ADEQUATE" | "HIGH";

export interface ClientVisit {
  id: string;
  status: VisitStatus;
  outcome: VisitOutcome | null;
  outcomeReason: string | null;
  stockObservation: StockObservation | null;
  actualVisitAt: string | null;
  notes: string | null;
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
    factory: {
      id: string;
      nomeFantasia: string | null;
      razaoSocial: string;
    } | null;
  } | null;
}

export interface ClientVisitsQueryResponse {
  visitsBySellerClientFactory: {
    edges: { node: ClientVisit }[];
    totalCount: number;
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
