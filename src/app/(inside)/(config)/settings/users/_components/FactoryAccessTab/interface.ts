export interface SellerFactoryAccessConnectionResponse {
  seller_factory_access_list: {
    edges: { node: SellerFactoryAccess }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface QueryData {
  seller_factory_access_list: SellerFactoryAccessConnectionResponse["seller_factory_access_list"];
}

export interface SellerFactoryAccess {
  id: string;
  isActive: boolean;
  createdAt: string;
  /** Fatia da comissão da fábrica que fica com o vendedor; nulo = 100%. */
  sellerCommissionShare: string | number | null;
  /** Quando o escritório repassa; nulo = mesma base da fábrica. */
  sellerCommissionBasis: string | null;
  seller: {
    id: string;
    name: string;
    isActive: boolean;
  } | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
  grantedByUser: {
    id: string;
    name: string;
  } | null;
}

/** Taxa de comissão de uma fábrica vinculada (alimenta a prévia do acordo). */
export interface AccessFactoryRate {
  id: string;
  factoryId: string;
  commissionRate: number;
}

export interface AccessFactoryRateResponse {
  access_factory_rate: { edges: { node: AccessFactoryRate }[] };
}
