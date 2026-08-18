export interface SettlePreviewResponse {
  settleInstallmentsPreview: {
    count: number;
    amount: string;
  };
}

export interface SettleResponse {
  settleInstallmentsInPeriod: {
    status: boolean;
    message: string;
  };
}

export interface SettlePeriodModalProps {
  /** Vendedor em foco na tela; a baixa pode ampliar para a empresa toda. */
  sellerId: string | null;
  sellerName: string | null;
  /** Fábricas com comissão na tela, para limitar a baixa a uma delas. */
  factoryOptions: { value: string; label: string }[];
  onSettled: () => void;
}
