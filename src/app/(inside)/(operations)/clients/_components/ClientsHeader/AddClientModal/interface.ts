export interface AddClientInput {
  cnpj: string;
  notes?: string | null;
}

export interface AddClientToCompanyResponse {
  addClientToCompany: {
    status: boolean;
    code: number;
    message: string;
    data: {
      id: string;
      clientId: string;
    } | null;
  };
}
