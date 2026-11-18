export interface ImportSellerRow {
  name: string;
  email: string;
  cpf: string | null;
  region: string | null;
}

export interface ImportSellerRowDetail {
  row: number;
  email: string;
  message: string;
}

export interface ImportSellersResult {
  total: number;
  created: number;
  failed: number;
  errors: ImportSellerRowDetail[];
  accessEmailsDeferred: boolean;
}

export interface ImportSellersResponse {
  importSellers: {
    status: boolean;
    message: string;
    data: ImportSellersResult | null;
  };
}

export interface ImportSellersModalProps {
  /** Chamado quando ao menos um vendedor entrou — quem abriu recarrega o que mostra. */
  onImported: () => void;
}
