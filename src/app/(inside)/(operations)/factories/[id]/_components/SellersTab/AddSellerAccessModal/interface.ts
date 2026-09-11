import { SellerAccess } from "../gql";

export interface CreateAccessResponse {
  createSellerFactoryAccess: {
    status: boolean;
    message: string;
    /** A linha pronta para a tabela — ver o `data` da mutation. */
    data: SellerAccess | null;
  };
}

export interface FactorySellersOptionsData {
  factory_sellers_options: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
    totalCount: number;
  };
}

export interface FactoryLinkedAccessesData {
  factory_linked_accesses: {
    edges: { node: { sellerId: string } }[];
    totalCount: number;
  };
}
