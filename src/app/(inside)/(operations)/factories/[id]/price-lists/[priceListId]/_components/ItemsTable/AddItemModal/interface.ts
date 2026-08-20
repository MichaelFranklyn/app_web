export interface ProductOptionNode {
  id: string;
  name: string;
  sku: string;
  unitLabel: { id: string; label: string } | null;
}

export interface ProductsData {
  products: {
    edges: {
      node: ProductOptionNode;
    }[];
  };
}

export interface TiersData {
  priceTiers: {
    edges: { node: { id: string; name: string } }[];
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
