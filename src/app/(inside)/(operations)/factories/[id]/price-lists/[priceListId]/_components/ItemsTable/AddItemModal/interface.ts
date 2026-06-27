export interface ProductsData {
  products: {
    edges: {
      node: {
        id: string;
        name: string;
        sku: string;
        unitLabel: { id: string; label: string } | null;
      };
    }[];
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
