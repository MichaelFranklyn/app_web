export interface CreateAccessResponse {
  createSellerFactoryAccess: {
    status: boolean;
    message: string;
    data: {
      id: string;
      isActive: boolean;
      createdAt: string;
      seller: {
        id: string;
        name: string;
        region: string | null;
        clientCount: number;
        factoryCount: number;
        totalRevenue: string;
      } | null;
      grantedByUser: { id: string; name: string } | null;
    } | null;
  };
}

export interface FactorySellersOptionsData {
  factory_sellers_options: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
  };
}

export interface FactoryLinkedAccessesData {
  factory_linked_accesses: {
    edges: { node: { sellerId: string } }[];
  };
}
