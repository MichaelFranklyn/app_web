export interface PriceListsData {
  factoryPriceLists: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
    totalCount: number;
  };
}

export interface TiersData {
  priceTiers: {
    edges: { node: { id: string; name: string; baseTierId: string | null } }[];
    totalCount: number;
  };
}

export interface CreateItemResponse {
  createPriceListItem: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}
