export interface CommissionAgreementModalProps {
  id: string;
  sellerName: string;
  factoryName: string;
  /**
   * A comissão que a fábrica paga à empresa, em %. É o que traduz a fatia em
   * dinheiro na prévia — sem ela, "50%" não diz quanto o vendedor ganha.
   */
  factoryCommissionRate: number;
  /** Percentual atual da comissão que fica com o vendedor; nulo = 100%. */
  sellerCommissionShare: string | number | null;
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
