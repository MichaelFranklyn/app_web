import type { WalletStatus } from "../_shared/hygiene/interface";

export type HygieneReason =
  | "RECEITA_INACTIVE"
  | "NO_RECENT_PURCHASE"
  | "NEVER_BOUGHT";

export interface HygieneItem {
  receitaStatus: string | null;
  lastOrderDate: string | null;
  reasons: HygieneReason[];
  companyClient: {
    id: string;
    status: WalletStatus;
    createdAt: string;
    client: {
      id: string;
      cnpj: string;
      razaoSocial: string;
      nomeFantasia: string | null;
      nickname: string | null;
    } | null;
  };
}

export interface ClientHygieneData {
  clientHygiene: {
    receitaPending: number;
    items: HygieneItem[];
  };
}

export interface CheckWalletReceitaResponse {
  checkWalletReceita: {
    status: boolean;
    message: string;
    data: {
      checked: number;
      inactiveFound: number;
      stoppedByLimit: boolean;
      remaining: number;
    } | null;
  };
}
