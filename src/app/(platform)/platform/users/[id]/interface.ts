import { PlatformUserRow } from "../interface";

/** A ficha traz os MESMOS campos da lista de propósito: dois formatos para o
 * mesmo registro só criariam a chance de divergirem. */
export type PlatformUserDetail = PlatformUserRow;

export interface UserActivityEntry {
  id: string;
  createdAt: string;
  operation: string;
  status: string;
  errorMessage: string | null;
  durationMs: number | null;
}

export interface UserQueryData {
  platformUser: { data: PlatformUserDetail | null };
}

export interface UserActivityQueryData {
  user_activity: {
    edges: { node: UserActivityEntry }[];
    totalCount: number;
  };
}

export interface UserDetailContentProps {
  id: string;
  seedUser: UserQueryData | null;
  seedActivity: UserActivityQueryData | null;
}
