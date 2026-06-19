export interface LinkFactoryResponse {
  linkFactory: {
    status: boolean;
    message: string;
    data: {
      id: string;
      companyId: string;
      factoryId: string;
      commissionRate: number;
      commissionCalcBasis: string;
      paymentTermDays: number;
      territory: string;
      contractStart: string | null;
      contractEnd: string | null;
      createdAt: string;
      updatedAt: string;
      factory: {
        id: string;
        cnpj: string;
        razaoSocial: string;
        nomeFantasia: string | null;
        addressCity: string | null;
        addressState: string | null;
        deletedAt: string | null;
      };
    } | null;
  };
}
