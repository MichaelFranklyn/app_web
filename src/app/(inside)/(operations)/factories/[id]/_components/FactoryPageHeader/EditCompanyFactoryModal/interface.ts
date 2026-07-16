export interface UpdateCompanyFactoryInput {
  commissionRate?: number;
  commissionCalcBasis?: string;
  paymentTermDays?: number;
  commissionPaymentDays?: number[];
  territory?: string;
  contractStart?: string;
  contractEnd?: string;
  ipiInOrder?: boolean;
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
    } | null;
  };
}
