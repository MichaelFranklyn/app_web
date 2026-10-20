/**
 * `VISIT_OVERDUE` é a visita SEM RESPOSTA (o nome do enum é histórico); a
 * frequência vencida é `VISIT_FREQUENCY`. Os dois não se confundem na tela.
 */
export type PendingType =
  | "VISIT_OVERDUE"
  | "RETURN_SCHEDULED"
  | "VISIT_FREQUENCY"
  | "ORDER_STALLED"
  | "INSTALLMENT_OVERDUE"
  | "CLIENT_NO_CONTACT"
  | "ADDRESS_ISSUE";

/** A faixa do prazo — os contadores clicáveis do topo. */
export type PendingWhen =
  | "OVERDUE"
  | "TODAY"
  | "NEXT_7_DAYS"
  | "LATER"
  | "NO_DUE";

/** Por que a pendência existe — é o que `reasonText` traduz em frase. */
export type PendingReason =
  | "VISIT_UNANSWERED"
  | "RETURN_DATE"
  | "WANTS_VISIT"
  | "DRAFT_STALE"
  | "PENDING_INVOICE"
  | "DELIVERY_UNCONFIRMED"
  | "NO_CONTACT"
  | "NEVER_CONTACTED"
  | "FREQUENCY_DUE"
  | "INSTALLMENT_UNPAID"
  | "LOCATION_MISSING"
  | "LOCATION_APPROXIMATE";

export type PendingPriority = "HIGH" | "MEDIUM" | "LOW";

export interface PendingItem {
  /** Identidade estável da linha (não é o id de um registro). */
  id: string;
  /** O registro apontado: visita, pedido, cliente, retorno ou contato. */
  entityId: string;
  clientId: string;
  type: PendingType;
  reason: PendingReason;
  priority: PendingPriority;
  /**
   * O prazo (ISO): o dia em que devia ter sido feito, ou o dia combinado.
   * Nulo = sem prazo (endereço).
   */
  dueDate: string | null;
  /** Dias de atraso; negativo = ainda faltam dias. Nulo sem prazo. */
  daysLate: number | null;
  clientName: string;
  /** Onde se resolve: a rota do dia, o pedido ou a ficha do cliente. */
  link: string | null;
  clientLink: string | null;
  factoryName: string | null;
  sellerId: string | null;
  sellerName: string | null;
  /** Valor do pedido (pedido parado) ou das parcelas vencidas (boleto). */
  amount: string | null;
  /**
   * O fato de onde o prazo conta (ISO): dia da visita, do pedido, do
   * faturamento (entrega), do último contato ou da entrada na carteira.
   */
  referenceDate: string | null;
  /** Visita vencida: era ligação, e não ida ao cliente. */
  isRemote: boolean;
  /** A régua: dias entre `referenceDate` e o prazo. Nulo = prazo combinado. */
  allowanceDays: number | null;
  /**
   * `referenceDate` é substituto: pedido confirmado antes de existir o carimbo
   * de confirmação conta da data do pedido, e o prazo é estimado.
   */
  isEstimated: boolean;
  /** Atraso a partir do qual vira Alta. Nulo = nunca chega a Alta. */
  highAfterDays: number | null;
  /** Contato marcado depois desta semana — não dispensa a pendência (ISO). */
  scheduledDate: string | null;
  /** Uma nota escrita por alguém sobre a pendência, quando houver. */
  note: string | null;
  /** O pedido de onde vem (pedido parado, boleto vencido). */
  orderId: string | null;
  /** Pós-venda: data do pedido (ISO) — é por ela que o cliente o reconhece. */
  orderDate: string | null;
  /** Pós-venda: telefone de quem falar no cliente (nulo sem contato). */
  contactPhone: string | null;
  /** Boleto vencido: quantas parcelas do pedido estão vencidas. */
  installmentCount: number | null;
}

export interface PendingTypeCount {
  type: PendingType;
  count: number;
  highCount: number;
  /**
   * As mais urgentes do assunto, para o cartão. Opcional: um backend anterior
   * ao campo (deploy em andamento) não o manda, e o cartão sai sem a amostra.
   */
  samples?: PendingItem[];
}

export interface PendingWhenCount {
  when: PendingWhen;
  count: number;
  highCount: number;
}

/** O resumo da tela: os cartões por assunto e os contadores de prazo. */
export interface PendingItemsData {
  generatedAt: string;
  totalCount: number;
  counts: PendingTypeCount[];
  whenCounts: PendingWhenCount[];
}

/** A lista de UM assunto, aberta na página. */
export interface PendingCasesResponse {
  myPendingItems: {
    status: boolean;
    message: string;
    data: { totalCount: number; items: PendingItem[] } | null;
  } | null;
}

export interface MyPendingItemsResponse {
  myPendingItems: {
    status: boolean;
    message: string;
    data: PendingItemsData | null;
  } | null;
}

export interface PendingSellersResponse {
  pending_sellers: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
    totalCount: number;
  };
}

export interface PendingContentProps {
  /** Gestor (owner/admin): filtra por vendedor e vê a coluna de quem é. */
  canSelectSeller: boolean;
  /** O resumo (cartões e contadores) já lido no servidor; null se o SSR falhou. */
  seed: MyPendingItemsResponse | null;
}
