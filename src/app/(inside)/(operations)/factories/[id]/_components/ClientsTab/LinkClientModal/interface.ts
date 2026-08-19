export interface CompanyClientNode {
  id: string;
  isActive: boolean;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
}

export interface CompanyClientsData {
  companyClients: {
    edges: { node: CompanyClientNode }[];
    totalCount: number;
  };
}

export interface SellerAccessNode {
  id: string;
  sellerId: string;
  isActive: boolean;
  seller: { id: string; name: string } | null;
}

export interface SellersAccessData {
  sellerFactoryAccessList: {
    edges: { node: SellerAccessNode }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

export interface ExistingLinkNode {
  id: string;
  clientId: string;
  sellerId: string;
  seller: { id: string; name: string } | null;
}

export interface ExistingLinksData {
  sellerClientFactoryList: {
    edges: { node: ExistingLinkNode }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

export interface CreateResponse {
  createSellerClientFactory: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}
