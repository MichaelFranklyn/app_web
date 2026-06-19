export interface ImportFactoryRow {
  cnpj: string;
  commissionRate: number;
  commissionCalcBasis: string;
  paymentTermDays: number;
  territory: string;
  contractStart: string | null;
  contractEnd: string | null;
  specialConditions: { note: string } | null;
}

export interface ImportRowDetail {
  row: number;
  cnpj: string;
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

export interface ImportCompanyFactoriesResponse {
  importCompanyFactories: {
    status: boolean;
    message: string;
    data: ImportResult | null;
  };
}
