export interface CommissionAgreementModalProps {
  id: string;
  sellerName: string;
  factoryName: string;
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
