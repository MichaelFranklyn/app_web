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

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}
