export interface SignUpFormData {
  cnpj: string;
  segment: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  confirmPassword: string;
}

export interface RegisterCompanyInput {
  cnpj: string;
  segment: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
}

export interface RegisterCompanyResponse {
  registerCompany: {
    status: boolean;
    code: number;
    message: string;
    data: {
      accessToken: string;
      refreshToken: string;
      userId: string;
      userName: string;
      companyName: string;
      role: string;
    } | null;
  };
}
