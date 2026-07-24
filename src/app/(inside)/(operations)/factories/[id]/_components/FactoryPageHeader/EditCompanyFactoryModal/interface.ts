export interface UpdateCompanyFactoryInput {
  commissionRate?: number;
  commissionCalcBasis?: string;
  paymentTermDays?: number;
  commissionPaymentDays?: number[];
  territory?: string;
  contractStart?: string;
  contractEnd?: string;
  ipiInOrder?: boolean;
  deliveryEstimateDays?: number | null;
  nickname?: string;
  logoBase64?: string;
  logoFileName?: string | null;
}

export interface UpdateCompanyFactoryResponse {
  updateCompanyFactory: {
    status: boolean;
    message: string;
    data: {
      id: string;
      commissionRate: number;
      commissionCalcBasis: string;
      paymentTermDays: number;
      commissionPaymentDays: number[] | null;
      territory: string;
      contractStart: string | null;
      contractEnd: string | null;
      ipiInOrder: boolean;
      deliveryEstimateDays: number | null;
      nickname: string | null;
      logoUrl: string | null;
    } | null;
  };
}
