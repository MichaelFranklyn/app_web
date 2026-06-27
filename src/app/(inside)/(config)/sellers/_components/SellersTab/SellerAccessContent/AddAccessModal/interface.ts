export interface CreateAccessResponse {
  createSellerFactoryAccess: { status: boolean; message: string };
}

export interface SellersOptionsData {
  sellers_options: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
  };
}

export interface CompanyFactoriesOptionsData {
  company_factories_options: {
    edges: {
      node: {
        factoryId: string;
        factory: {
          id: string;
          nomeFantasia: string | null;
          razaoSocial: string;
        } | null;
      };
    }[];
  };
}

export interface SellerAccessesData {
  seller_accesses: {
    edges: {
      node: { sellerId: string; factoryId: string; isActive: boolean };
    }[];
  };
}
