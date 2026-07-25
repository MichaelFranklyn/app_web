export interface UpdateMyPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateMyPasswordResponse {
  updateMyPassword: {
    status: boolean;
    code: number;
    message: string;
  };
}
