export interface FactoryDetail {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  addressCity: string | null;
  addressState: string | null;
  deletedAt: string | null;
}

export interface CompanyFactoryDetail {
  id: string;
  commissionRate: number;
  commissionCalcBasis: string;
  paymentTermDays: number;
  commissionPaymentDays: number[] | null;
  territory: string;
  contractStart: string | null;
  contractEnd: string | null;
  specialConditions: Record<string, unknown> | null;
  ipiInOrder: boolean;
  /** Prazo de entrega padrão (dias), contado do faturamento. Nulo = sem padrão. */
  deliveryEstimateDays: number | null;
  factory: FactoryDetail;
}
