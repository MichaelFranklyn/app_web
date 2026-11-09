export type UserRole = "SU" | "SUPPORT" | "OWNER" | "ADMIN" | "SELLER";

export interface UserData {
  userId: string;
  userName: string;
  companyName: string;
  role: UserRole;
  /** Perfil de vendedor vinculado, se houver — owner/admin também podem vender. */
  sellerId?: string | null;
  /** Escritório desta sessão. A mesma pessoa pode trabalhar em vários (como
   *  projetos no Google Cloud); trocar de escritório troca a sessão inteira. */
  companyId?: string | null;
}

export interface LoginResponse {
  login: {
    status: boolean;
    code: number;
    message: string;
    data:
      | ({
          accessToken: string;
          refreshToken: string;
          isCompanyChoicePending: boolean;
        } & UserData)
      | null;
  };
}

export interface LoginFormData {
  email: string;
  password: string;
}
