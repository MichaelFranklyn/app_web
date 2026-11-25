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

export type PriceListImportStatus = "PENDING" | "RUNNING" | "DONE" | "FAILED";

/** A importação na fila do backend (`priceListImport`). */
export interface PriceListImportJob {
  id: string;
  status: PriceListImportStatus;
  /** Parada há tempo demais: a instância que rodava morreu no meio. */
  isStale: boolean;
  message: string | null;
  error: string | null;
  result: ImportPriceListResult | null;
}

interface JobPayload<T> {
  status: boolean;
  message: string;
  data: T | null;
}

export interface StartPriceListImportResponse {
  startFactoryPriceListImport: JobPayload<
    Pick<PriceListImportJob, "id" | "status" | "isStale">
  >;
}

export interface PriceListImportResponse {
  priceListImport: JobPayload<PriceListImportJob>;
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
