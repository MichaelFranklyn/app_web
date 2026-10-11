export type PendingType =
  | "VISIT_OVERDUE"
  | "RETURN_SCHEDULED"
  | "ORDER_STALLED"
  | "CLIENT_NO_CONTACT";

/** Por que a pendência existe — é o que `reasonText` traduz em frase. */
export type PendingReason =
  | "VISIT_UNANSWERED"
  | "RETURN_DATE"
  | "WANTS_VISIT"
  | "DRAFT_STALE"
  | "PENDING_INVOICE"
  | "DELIVERY_UNCONFIRMED"
  | "NO_CONTACT"
  | "NEVER_CONTACTED";

export type PendingPriority = "HIGH" | "MEDIUM" | "LOW";

export interface PendingItem {
  /** Identidade estável da linha (não é o id de um registro). */
  id: string;
  type: PendingType;
  reason: PendingReason;
  priority: PendingPriority;
  /** O prazo (ISO): o dia em que devia ter sido feito, ou o dia combinado. */
  dueDate: string;
  /** Dias de atraso; negativo = ainda faltam dias. */
  daysLate: number;
  clientName: string;
  /** Onde se resolve: a rota do dia, o pedido ou a ficha do cliente. */
  link: string | null;
  clientLink: string | null;
  factoryName: string | null;
  sellerId: string | null;
  sellerName: string | null;
  /** Valor do pedido — string decimal do backend; só em pedido parado. */
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
}

export interface PendingTypeCount {
  type: PendingType;
  count: number;
  highCount: number;
}

export interface PendingItemsData {
  generatedAt: string;
  totalCount: number;
  counts: PendingTypeCount[];
  items: PendingItem[];
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
  /** 1ª página já lida no servidor; null se o SSR falhou. */
  seed: MyPendingItemsResponse | null;
}
