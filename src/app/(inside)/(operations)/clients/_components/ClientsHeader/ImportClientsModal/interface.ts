export interface ImportClientRow {
  cnpj: string;
  notes: string | null;
  sellerEmail: string | null;
  factoryName: string | null;
}

export interface ImportRowDetail {
  row: number;
  cnpj: string;
  message: string;
}

export interface ImportResult {
  total: number;
  created: number;
  linksCreated: number;
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

export interface ImportSheetRow {
  cnpj: string;
  notes?: string | null;
  sellerEmail?: string | null;
  factoryName?: string | null;
}

/** A planilha baixada: a carteira e as listas suspensas de vendedor e fábrica. */
export interface ImportSheet {
  rows: ImportSheetRow[];
  sellerEmails: string[];
  factoryNames: string[];
}

export interface CompanyClientsImportSheetResponse {
  companyClientsImportSheet?: {
    status: boolean;
    message: string;
    data?: Partial<ImportSheet> | null;
  } | null;
}
