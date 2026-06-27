export interface CompanyClientsData {
  companyClients: {
    edges: {
      node: {
        id: string;
        isActive: boolean;
        client: {
          id: string;
          razaoSocial: string;
          nomeFantasia: string | null;
        } | null;
      };
    }[];
  };
}

export interface SellersAccessData {
  sellerFactoryAccessList: {
    edges: {
      node: {
        id: string;
        sellerId: string;
        isActive: boolean;
        seller: { id: string; name: string } | null;
      };
    }[];
  };
}

export interface ExistingLinksData {
  sellerClientFactoryList: {
    edges: { node: { id: string; clientId: string } }[];
  };
}

export interface CreateResponse {
  createSellerClientFactory: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}
