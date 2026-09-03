import {
  SupportCase,
  SupportStatus,
  SupportUpdate,
  SupportUpdateKind,
} from "@/utils/support";

/**
 * O caso com a conversa inteira. A linha do tempo só existe nesta tela — a fila
 * pede apenas o último andamento —, e por isso ela estende o tipo compartilhado
 * em vez de engordá-lo.
 */
export interface SupportCaseDetail extends SupportCase {
  updates: SupportUpdate[];
}

export interface SupportCaseQueryResponse {
  clientSupportCase: {
    status: boolean;
    message: string;
    data: SupportCaseDetail | null;
  };
}

export interface AddSupportUpdateResponse {
  addClientSupportUpdate?: {
    status: boolean;
    message: string;
    data?: { id: string } | null;
  };
}

export interface DeleteSupportCaseResponse {
  deleteClientSupportCase?: {
    status: boolean;
    code: number;
    message: string;
  };
}

/** O que o formulário de andamento manda. */
export interface UpdateDraft {
  body: string;
  kind: SupportUpdateKind;
  /** Situação nova; vazio = o caso continua onde está. */
  status: SupportStatus | "";
  resolution: string;
}
