import { CompanyFactoryDetail } from "../../../interface";

export interface UpdateCompanyFactoryInput {
  commissionRate?: number;
  commissionCalcBasis?: string;
  paymentTermDays?: number;
  territory?: string;
  contractStart?: string;
  contractEnd?: string;
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
      territory: string;
      contractStart: string | null;
      contractEnd: string | null;
    } | null;
  };
}

export interface EditCompanyFactoryModalProps {
  companyFactory: CompanyFactoryDetail;
  onRefetch: () => void;
}
