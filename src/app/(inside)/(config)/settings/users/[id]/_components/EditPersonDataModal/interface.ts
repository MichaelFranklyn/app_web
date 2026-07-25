import { UserDetail } from "../../../../../_shared/userProfile";

export interface UpdatePersonDataResponse {
  updateUser: {
    status: boolean;
    code: number;
    message: string;
    data: UserDetail | null;
  };
}
