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

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}
