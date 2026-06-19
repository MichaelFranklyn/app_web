import { MyProfile } from "../../interface";

export interface UpdateMyProfileInput {
  name?: string;
  email?: string;
}

export interface UpdateMyProfileResponse {
  updateMyProfile: {
    status: boolean;
    code: number;
    message: string;
    data: MyProfile | null;
  };
}
