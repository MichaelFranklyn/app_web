export interface CatalogOption {
  id: string;
  label: string;
}

export interface ProductUnitsData {
  productUnits: { edges: { node: CatalogOption }[]; totalCount: number };
}

export interface ProductUnitLabelsData {
  productUnitLabels: { edges: { node: CatalogOption }[]; totalCount: number };
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

/** Tabela vigente da fábrica — destino possível de uma planilha de outro grupo de clientes. */
export interface ActivePriceList {
  id: string;
  name: string;
  region: string;
}

/**
 * O que a planilha é: a nova versão da tabela (substitui a vigente da mesma
 * região) ou os preços de OUTRO grupo de clientes (ex.: Interior), que entram
 * como nível na tabela vigente sem mexer nos preços dos outros grupos.
 */
export type ImportMode = "replace" | "group";
