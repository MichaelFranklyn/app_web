export interface ImportProductRow {
  sku: string;
  name: string;
  category: string;
  unit: string;
  unitLabel: string;
  unitPerPack: number;
}

export interface ImportRowDetail {
  row: number;
  sku: string;
  message: string;
}

export interface ImportResult {
  total: number;
  created: number;
  skipped: number;
  failed: number;
  errors: ImportRowDetail[];
  ignored: ImportRowDetail[];
}

export interface ImportProductsResponse {
  importProducts: {
    status: boolean;
    message: string;
    data: ImportResult | null;
  };
}

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
