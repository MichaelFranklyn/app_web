import { FactoryProduct } from "../gql";

export interface CreateProductResponse {
  createProduct: {
    __typename?: "ProductTypeDataResponse";
    status: boolean;
    message: string;
    data: FactoryProduct | null;
  };
}

export interface TaxRulesData {
  taxRules: {
    edges: { node: { id: string; name: string } }[];
    totalCount: number;
  };
}

export interface CreateTaxRuleResponse {
  createTaxRule: {
    status: boolean;
    message: string;
    data: { id: string; name: string } | null;
  };
}

export interface AddProductTaxResponse {
  addTaxToProduct: {
    status: boolean;
    message: string;
  };
}

export interface FactoryPriceListsData {
  factoryPriceLists: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
    totalCount: number;
  };
}

export interface PriceTiersData {
  priceTiers: {
    edges: { node: { id: string; name: string } }[];
    totalCount: number;
  };
}

export interface CreatePriceListItemResponse {
  createPriceListItem: {
    status: boolean;
    message: string;
  };
}

/** Linha do passo "Impostos": regra + alíquota em % (ambos digitados pelo usuário). */
export interface TaxDraftRow {
  taxRuleId: string;
  rate: number;
}

/** Linha do passo "Preços": tabela + nível + preço da embalagem. */
export interface PriceDraftRow {
  priceListId: string;
  tierId: string;
  unitPrice: number;
}
