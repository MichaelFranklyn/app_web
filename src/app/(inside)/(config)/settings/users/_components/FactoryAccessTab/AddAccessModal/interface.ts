export interface CreateAccessResponse {
  createSellerFactoryAccess: {
    status: boolean;
    message: string;
    /** O vínculo criado — é com ele que a linha entra na tabela na hora. */
    data: { id: string; isActive: boolean; createdAt: string } | null;
  };
}

export interface SellersOptionsData {
  sellers_options: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
    totalCount: number;
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
    totalCount: number;
  };
}

export interface SellerAccessesData {
  seller_accesses: {
    edges: {
      node: { sellerId: string; factoryId: string; isActive: boolean };
    }[];
    totalCount: number;
  };
}
