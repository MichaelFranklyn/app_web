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
