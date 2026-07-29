import { DocumentNode } from "@apollo/client";

export interface UpdateOrderInput {
  notes?: string | null;
}

export interface UpdateOrderResponse {
  updateOrder: {
    status: boolean;
    code: number;
    message: string;
    data: {
      id: string;
      notes: string | null;
    } | null;
  };
}

export interface EditOrderModalProps {
  orderId: string;
  initialNotes: string | null;
  /**
   * Abertura controlada pelo pai — usado quando o gatilho NÃO pode ser um botão
   * dentro de outro modal (empilhar dois modais deixa o usuário sem saber qual
   * fechar). Definido, o modal não renderiza trigger próprio: quem controla
   * fecha o modal de origem antes de abrir este.
   */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Mutation de update do pedido — varia conforme a origem (fábrica ou cliente). */
  mutation: DocumentNode;
  /** Keys de cache a invalidar após salvar. Default: ["orders"]. */
  invalidateKeys?: string[];
  /** Impede o clique de propagar (ex.: trigger dentro de linha clicável). */
  stopPropagationOnTrigger?: boolean;
}
