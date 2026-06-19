export type UserRole = "SU" | "OWNER" | "ADMIN" | "SELLER";

export interface MyProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
}

export interface MeQueryResponse {
  me: {
    status: boolean;
    code: number;
    message: string;
    data: MyProfile | null;
  };
}
