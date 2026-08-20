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
  onSettled: () => void;
}

/** Fábricas do vínculo da empresa — o recorte opcional da baixa. */
export interface CommissionsFactoriesResponse {
  commissions_factories: {
    edges: {
      node: {
        id: string;
        factory: {
          id: string;
          nomeFantasia: string | null;
          nickname: string | null;
          razaoSocial: string;
        } | null;
      };
    }[];
    totalCount: number;
  };
}
