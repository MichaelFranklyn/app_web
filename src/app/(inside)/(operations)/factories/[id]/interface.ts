export interface FactoryDetail {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  addressCity: string | null;
  addressState: string | null;
  deletedAt: string | null;
}

export interface CompanyFactoryDetail {
  id: string;
  commissionRate: number;
  commissionCalcBasis: string;
  paymentTermDays: number;
  territory: string;
  contractStart: string | null;
  contractEnd: string | null;
  specialConditions: Record<string, unknown> | null;
  factory: FactoryDetail;
}

export interface CompanyFactoryDetailResponse {
  company_factory_detail: {
    status: boolean;
    message: string;
    data: CompanyFactoryDetail | null;
  };
}
