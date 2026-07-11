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
  /** Mutation de update do pedido — varia conforme a origem (fábrica ou cliente). */
  mutation: DocumentNode;
  /** Keys de cache a invalidar após salvar. Default: ["orders"]. */
  invalidateKeys?: string[];
  /** Impede o clique de propagar (ex.: trigger dentro de linha clicável). */
  stopPropagationOnTrigger?: boolean;
}
