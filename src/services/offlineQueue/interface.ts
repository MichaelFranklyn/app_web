/**
 * O que pode esperar o sinal voltar.
 *
 * A lista é curta de propósito. Só entra aqui gravação que pode ser REPETIDA
 * sem estrago, porque numa rede ruim o app não sabe se o pedido chegou: a
 * resposta pode ter se perdido no caminho de volta, e o aparelho envia de novo.
 *
 * - concluir/responder uma visita: mandar "concluída" para uma visita já
 *   concluída não repete nenhum efeito (`update_visit_schedule_item.py` só age
 *   na TRANSIÇÃO de status);
 * - estoque da visita: a gravação SUBSTITUI as respostas daquela visita.
 *
 * Pedido não entra: reenviado mais tarde ele precisaria reconferir preço,
 * promoção, nível e piso contra um catálogo que pode ter mudado (ver o
 * cabeçalho de `public/sw.js`). O pedido sem sinal fica como rascunho na
 * própria página.
 */
export type OfflineEntry = VisitStatusEntry | StockObservationsEntry;

interface BaseEntry {
  /**
   * Uma entrada por assunto: a resposta nova sobre a mesma visita substitui a
   * anterior em vez de enfileirar as duas.
   */
  key: string;
  /** Dono da gravação. Outra pessoa no mesmo aparelho nunca a envia. */
  userId: string;
  /** Quando o vendedor tocou (ISO). É a hora que vai ao servidor. */
  createdAt: string;
  /** Como a pessoa reconhece o registro: o nome do cliente. */
  label: string;
}

export interface VisitStatusEntry extends BaseEntry {
  kind: "visitStatus";
  variables: {
    id: string;
    status: string;
    /** Hora da visita — a do toque, não a do envio. */
    actualVisitAt?: string;
  };
}

export interface StockObservationsEntry extends BaseEntry {
  kind: "stockObservations";
  variables: {
    itemId: string;
    observations: { productId: string; daysRemaining: number | null }[];
    /** Dia em que o vendedor viu a prateleira (YYYY-MM-DD). */
    observedOn: string;
  };
}

/** Registro que o servidor recusou ao chegar — a pessoa precisa saber. */
export interface OfflineFailure {
  key: string;
  userId: string;
  label: string;
  message: string;
}

export interface OfflineQueueState {
  entries: OfflineEntry[];
  failures: OfflineFailure[];
}
