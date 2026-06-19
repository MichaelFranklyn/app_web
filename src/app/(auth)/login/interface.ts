export type UserRole = "SU" | "OWNER" | "ADMIN" | "SELLER";

export interface UserData {
  userId: string;
  userName: string;
  companyName: string;
  role: UserRole;
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
        } & UserData)
      | null;
  };
}

export interface LoginFormData {
  email: string;
  password: string;
}
