export interface UpdateMyPasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateMyPasswordResponse {
  updateMyPassword: {
    status: boolean;
    code: number;
    message: string;
    /** Token novo desta sessão; só o BFF o lê (ver /api/session). */
    data: { accessToken: string } | null;
  };
}
