// Itens por página. Compartilhado entre o fetch SSR (page.tsx) e o useTableData
// (content.tsx) para as variáveis da query não divergirem.
export const ITEMS_PER_PAGE = 12;

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
