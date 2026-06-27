export interface PriceListsData {
  factoryPriceLists: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
  };
}

export interface TiersData {
  priceTiers: { edges: { node: { id: string; name: string } }[] };
}

export interface CreateItemResponse {
  createPriceListItem: {
    status: boolean;
    message: string;
    data: { id: string } | null;
  };
}
