export interface CatalogOption {
  id: string;
  label: string;
}

export interface ProductUnitsData {
  productUnits: { edges: { node: CatalogOption }[] };
}

export interface ProductUnitLabelsData {
  productUnitLabels: { edges: { node: CatalogOption }[] };
}

/** Uma coluna de preço da planilha vinculada a um nível comercial. */
export interface TierColumn {
  id: string;
  columnIndex: number | null;
  tierName: string;
}

/** Uma coluna de alíquota da planilha vinculada a um imposto aditivo simples (ICMS, FECP...). */
export interface TaxColumn {
  id: string;
  columnIndex: number | null;
  taxName: string;
}

export interface ImportPriceRowDetail {
  row: number;
  sku: string;
  message: string;
}

export interface ImportPriceListResult {
  listName: string;
  totalRows: number;
  tiers: number;
  productsCreated: number;
  productsReused: number;
  pricesSet: number;
  failed: number;
  attention: number;
  errors: ImportPriceRowDetail[];
}

export interface ImportPriceListResponse {
  importFactoryPriceList: {
    status: boolean;
    message: string;
    data: ImportPriceListResult | null;
  };
}
