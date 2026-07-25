export interface UsersQueryResponse {
  users_list: {
    edges: { node: User }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
}

export interface QueryData {
  users_list: UsersQueryResponse["users_list"];
}

// Itens por página. Compartilhado entre o fetch SSR (page.tsx) e o useTableData
// (content.tsx) para as variáveis da query não divergirem.
export const ITEMS_PER_PAGE = 10;

/** Perfil de campo da pessoa. Ausente = ela não vende. */
export interface UserSellerProfile {
  id: string;
  isActive: boolean;
  region: string | null;
  factoryCount: number;
  clientCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  phone: string | null;
  createdAt: string;
  seller: UserSellerProfile | null;
}

export interface SellersStats {
  totalCount: number;
  activeCount: number;
  activeFactoryAccessCount: number;
  inactiveFactoryAccessCount: number;
}

export interface SellersStatsRaw {
  sellerStats: SellersStats;
}
