export type VisitContactType = "IN_PERSON" | "REMOTE";

export interface VisitLinkNode {
  id: string;
  sellerId: string;
  factoryId: string;
  seller: { id: string; name: string } | null;
  factory: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
}

export interface ClientLinksQueryResponse {
  sellerClientFactoryList: {
    edges: { node: VisitLinkNode }[];
    totalCount: number;
  };
}

export interface WalletClientNode {
  id: string;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
}

export interface WalletClientsQueryResponse {
  sellerClientFactoryList: {
    edges: { node: WalletClientNode }[];
    totalCount: number;
  };
}

export interface ScheduleManualVisitResponse {
  scheduleManualVisit?: {
    status: boolean;
    message: string;
    data?: { id: string; scheduleDayId: string } | null;
  };
}

export interface ScheduleVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Cliente já definido (tela do cliente). Ausente = o modal pergunta qual,
   * entre os da carteira do vendedor de `sellerId`.
   */
  clientId?: string;
  /** Nome mostrado no cabeçalho quando o cliente já vem definido. */
  clientName?: string;
  /**
   * Vendedor da visita. Obrigatório quando o cliente é escolhido aqui (a
   * carteira é de alguém). Com o cliente definido, ausente = o modal descobre
   * pelos vínculos e só pergunta se houver mais de um.
   */
  sellerId?: string | null;
  /** Data sugerida (ISO yyyy-mm-dd) — o dia que a tela estava mostrando. */
  defaultDate?: string;
  /** Chamado depois de marcar, para a tela rebuscar o que mostra. */
  onScheduled?: () => void;
}
