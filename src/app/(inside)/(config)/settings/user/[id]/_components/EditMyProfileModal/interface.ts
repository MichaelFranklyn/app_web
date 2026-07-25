import { UserDetail } from "../../../../../_shared/userProfile";

export interface UpdateMyProfileResponse {
  updateMyProfile: {
    status: boolean;
    code: number;
    message: string;
    data: UserDetail | null;
  };
}
