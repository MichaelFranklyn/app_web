export interface CompanyFactoriesData {
  companyFactories: {
    edges: {
      node: {
        id: string;
        factoryId: string;
        ipiInOrder: boolean;
        freeFreightCifAmount: number | null;
      };
    }[];
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

/** Imposto vinculado ao produto; `rate` é percentual (3.25 = 3,25%). */
export interface ProductTaxRef {
  id: string;
  rate: string;
  calcType: "RATE" | "ST_MVA";
  taxRule: { id: string; name: string } | null;
}

export interface ProductNode {
  id: string;
  name: string;
  sku: string | null;
  /** Foto do produto; alimenta a miniatura ao lado da opção no select. */
  imageUrl: string | null;
  saleMultiple: string | null;
  unitPerPack: string;
  unit: { id: string; label: string } | null;
  taxes: ProductTaxRef[];
}

export interface ProductsData {
  products: {
    edges: { node: ProductNode }[];
    pageInfo: ConnectionPageInfo;
  };
}

export interface LinkedTierData {
  sellerClientFactoryList: {
    edges: { node: { id: string; priceTierId: string | null } }[];
  };
}

export interface TiersData {
  priceTiers: {
    edges: { node: { id: string; name: string } }[];
  };
}

export interface PriceListItemNode {
  id: string;
  unitPrice: string;
  /** Preço que vale hoje: promocional se a promoção está ativa, senão o de tabela. */
  effectiveUnitPrice: string;
  isPromoActive: boolean;
  product: {
    id: string;
    name: string;
    sku: string;
    saleMultiple: string | null;
    unitPerPack: string;
  } | null;
  tier: { id: string; name: string } | null;
}

export interface PriceListItemsData {
  priceListItems: {
    edges: { node: PriceListItemNode }[];
    pageInfo: ConnectionPageInfo;
  };
}
