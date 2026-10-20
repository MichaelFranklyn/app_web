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

interface ClientNameNode {
  id: string;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
}

export interface WalletClientsQueryResponse {
  sellerClientFactoryList: {
    edges: { node: ClientNameNode }[];
    totalCount: number;
  };
}

export interface CompanyClientsQueryResponse {
  schedule_clients: {
    edges: { node: ClientNameNode }[];
    totalCount: number;
  };
}

export type CompanyClientNode = ClientNameNode;

export interface PeopleQueryResponse {
  schedule_people: {
    edges: {
      node: {
        id: string;
        name: string;
        isActive: boolean;
        seller: { id: string } | null;
      };
    }[];
  };
}

export interface ClientOrderNode {
  id: string;
  orderDate: string;
  invoiceNumber: string | null;
  factory: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    nickname: string | null;
  } | null;
}

export interface ClientOrdersQueryResponse {
  schedule_orders: { edges: { node: ClientOrderNode }[] };
}

export interface ScheduleManualVisitResponse {
  scheduleManualVisit?: {
    status: boolean;
    message: string;
    data?: { id: string; scheduleDayId: string } | null;
  };
}

/** Uma pessoa cuja agenda recebe a parada. `sellerId` nulo = não vende. */
export interface AgendaOwner {
  id: string;
  name: string;
  sellerId: string | null;
}

export interface ScheduleVisitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Cliente já definido (ficha do cliente, pedido, pendência). Ausente = o
   * modal pergunta qual — entre os da carteira de quem vai fazer.
   */
  clientId?: string;
  /** Nome mostrado no cabeçalho quando o cliente já vem definido. */
  clientName?: string;
  /**
   * Vendedor já definido (a rotina dele). Ausente = o gestor escolhe a pessoa
   * no modal; o vendedor logado marca sempre na própria agenda.
   */
  sellerId?: string | null;
  /**
   * A pessoa cuja agenda está aberta — inclusive quem não vende (escritório),
   * cuja agenda só recebe ligação. Fixa a agenda: o modal não pergunta.
   */
  owner?: AgendaOwner | null;
  /** Data sugerida (ISO yyyy-mm-dd) — o dia que a tela estava mostrando. */
  defaultDate?: string;
  /**
   * Tipo já decidido por quem abriu (a Agenda pergunta "ligação ou visita"
   * antes): o modal não repete a pergunta. Ausente = o modal pergunta.
   */
  contactType?: VisitContactType;
  /** Pedido já definido (marcado a partir do pedido). */
  orderId?: string;
  /** "12/08/2026 · NF 1234 · Herc" — o pedido fixo, para o cabeçalho. */
  orderLabel?: string;
  /** O "volte dia X" (a parada que o ouviu) que esta parada vai atender. */
  returnItemId?: string;
  /** "16/10/2026" — o dia do retorno, para o cabeçalho dizer o vínculo. */
  returnLabel?: string;
  /** Chamado depois de marcar, para a tela rebuscar o que mostra. */
  onScheduled?: () => void;
}
