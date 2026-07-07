export interface ImportClientRow {
  cnpj: string;
  notes: string | null;
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

export interface ImportCompanyClientsResponse {
  importCompanyClients: {
    status: boolean;
    message: string;
    data: ImportResult | null;
  };
}
