/** Situação do cliente na carteira (enum `WalletStatus` do backend). */
export type WalletStatus = "ACTIVE" | "CLOSED" | "ENDED" | "SUCCEEDED";

/** Os dois jeitos de encerrar à mão (mudar de CNPJ tem fluxo próprio). */
export type EndingStatus = "CLOSED" | "ENDED";

export interface MutationPayload<T> {
  status: boolean;
  message: string;
  data: T | null;
}

export interface EndCompanyClientResponse {
  endCompanyClient: MutationPayload<{ cancelledVisits: number }>;
}

export interface ReactivateCompanyClientResponse {
  reactivateCompanyClient: MutationPayload<{ id: string }>;
}

export interface TransferCompanyClientCnpjResponse {
  transferCompanyClientCnpj: MutationPayload<{
    movedLinks: number;
    movedContacts: number;
    newCompanyClient: { id: string };
  }>;
}

export interface ReceitaChange {
  field: "razaoSocial" | "nomeFantasia";
  before: string | null;
  after: string | null;
}

export interface RefreshClientFromReceitaResponse {
  refreshClientFromReceita: MutationPayload<{
    client: { id: string; receitaStatus: string | null };
    changes: ReceitaChange[];
  }>;
}

/** O que as ações precisam saber do cliente em que estão. */
export interface HygieneTarget {
  companyClientId: string;
  clientName: string;
  status: WalletStatus;
}
