export interface RequestPasswordResetResponse {
  requestPasswordReset: {
    status: boolean;
    code: number;
    message: string;
  };
}
