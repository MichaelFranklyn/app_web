import { Client } from "../../../interface";

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
      // id da carteira (company_client) — usado como companyClient.id na linha otimista
      id: string;
      clientId: string;
      client: Omit<Client, "companyClient">;
    } | null;
  };
}
