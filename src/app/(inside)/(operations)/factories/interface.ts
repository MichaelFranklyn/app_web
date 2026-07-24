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
    /** Apelido que a empresa deu à fábrica (mora no vínculo). */
    nickname: string | null;
    /** Logo enviada pela empresa (caminho relativo /media/...). */
    logoUrl: string | null;
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
