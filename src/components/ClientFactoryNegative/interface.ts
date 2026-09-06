/**
 * Tipos da negativação de um cliente numa fábrica — o vínculo visto pelas duas
 * pontas que a editam (a aba Fábricas do cliente e a aba Clientes da fábrica).
 */

/** O estado de negativação, como as duas tabelas o carregam. */
export interface ClientFactoryNegativeState {
  isNegative: boolean;
  /** Desde quando (ISO "AAAA-MM-DD"). Nulo quando não está negativado. */
  negativeSince: string | null;
  /** O que a fábrica informou. Nulo quando ninguém escreveu o motivo. */
  negativeReason: string | null;
}

export interface SetClientFactoryNegativeResponse {
  setSellerClientFactoryNegative: {
    status: boolean;
    message: string;
    data: ({ id: string } & ClientFactoryNegativeState) | null;
  };
}

interface NegativeModalBase {
  linkId: string;
  /** Nome da fábrica, para o texto dizer de qual crédito se está falando. */
  factoryName: string;
  /** Nome do cliente. Omitido na tela do cliente, onde ele já é o assunto. */
  clientName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Chamado com o estado novo depois de o servidor confirmar. */
  onSaved?: (state: ClientFactoryNegativeState) => void;
}

export type MarkNegativeModalProps = NegativeModalBase;

export interface ClearNegativeModalProps extends NegativeModalBase {
  /** Desde quando estava negativado — vira "parado há X" no texto. */
  negativeSince: string | null;
}

export interface NegativeLinkModalProps extends NegativeModalBase {
  /** Qual das duas ações o modal abre: marcar ou retirar. */
  isNegative: boolean;
  negativeSince?: string | null;
}
