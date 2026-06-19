import { UserData } from "../login/interface";

export interface ResetPasswordResponse {
  resetPassword: {
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
