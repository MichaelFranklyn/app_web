export interface CompanyFactory {
  id: string;
  commissionRate: number;
  commissionCalcBasis: string;
  paymentTermDays: number;
  contractStart: string | null;
  contractEnd: string | null;
  factory: {
    id: string;
    cnpj: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    addressCity: string | null;
    addressState: string | null;
    deletedAt: string | null;
  };
}

export interface CompanyFactoriesQueryData {
  company_factories_list: {
    edges: { node: CompanyFactory }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}
