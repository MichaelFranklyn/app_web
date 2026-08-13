export interface PlatformUserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  companyId: string;
  companyName: string;
}

export interface UsersQueryData {
  platform_users: {
    edges: { node: PlatformUserRow }[];
    totalCount: number;
  };
}

export interface UsersContentProps {
  initialData: UsersQueryData | null;
}
