export interface CommissionAgreementModalProps {
  id: string;
  sellerName: string;
  factoryName: string;
  /**
   * A fábrica do vínculo. O modal busca a comissão dela ao abrir — é ela que
   * diz quanto sobra para o escritório; sem isso, "3%" não diz se o acordo
   * cabe no que a fábrica paga.
   */
  factoryId: string;
  /** Percentual atual do PEDIDO que fica com o vendedor; nulo = comissão inteira. */
  sellerCommissionRate: string | number | null;
  /** Base atual do repasse; nulo = a mesma da fábrica. */
  sellerCommissionBasis: string | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}

export interface UpdateAgreementResponse {
  updateSellerFactoryAccess: {
    status: boolean;
    message: string;
  };
}
