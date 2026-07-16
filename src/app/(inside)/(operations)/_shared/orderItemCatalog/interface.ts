export interface CompanyFactoriesData {
  companyFactories: {
    edges: { node: { id: string; factoryId: string; ipiInOrder: boolean } }[];
  };
}

export interface ConnectionPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface PriceListsData {
  factoryPriceLists: {
    edges: {
      node: {
        id: string;
        name: string;
        isActive: boolean;
        validFrom: string;
        validUntil: string | null;
      };
    }[];
  };
}

export interface ProductsData {
  products: {
    edges: {
      node: {
        id: string;
        name: string;
        sku: string | null;
        saleMultiple: string | null;
        unitPerPack: string;
        unit: { id: string; label: string } | null;
      };
    }[];
    pageInfo: ConnectionPageInfo;
  };
}

export interface TiersData {
  priceTiers: {
    edges: { node: { id: string; name: string } }[];
  };
}

export interface PriceListItemsData {
  priceListItems: {
    edges: {
      node: {
        id: string;
        unitPrice: string;
        product: {
          id: string;
          name: string;
          sku: string;
          saleMultiple: string | null;
          unitPerPack: string;
        } | null;
        tier: { id: string; name: string } | null;
      };
    }[];
    pageInfo: ConnectionPageInfo;
  };
}
