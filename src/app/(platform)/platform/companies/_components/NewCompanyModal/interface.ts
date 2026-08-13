export interface ProvisionCompanyInput {
  cnpj: string;
  segment: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword?: string | null;
}

export interface ProvisionedCompany {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  segment: string;
}

export interface ProvisionedOwner {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ProvisionCompanyPayload {
  company: ProvisionedCompany;
  owner: ProvisionedOwner;
  firstAccessLink: string | null;
}

export interface ProvisionCompanyResponse {
  provisionCompany: {
    status: boolean;
    code: number;
    message: string;
    data: ProvisionCompanyPayload | null;
  };
}
