import { FollowUpMutationPayload } from "@/graphql/followUps";
import { FollowUp } from "@/utils/followUp";

export interface ClientOptionNode {
  id: string;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
}

export interface ClientOptionsData {
  follow_up_clients: {
    edges: { node: ClientOptionNode }[];
    totalCount: number;
  };
}

export interface ClientOrderNode {
  id: string;
  orderDate: string;
  invoiceNumber: string | null;
  status: string;
  factory: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    nickname: string | null;
  } | null;
}

export interface ClientOrdersData {
  follow_up_orders: {
    edges: { node: ClientOrderNode }[];
    totalCount: number;
  };
}

export interface PeopleData {
  follow_up_people: {
    edges: { node: { id: string; name: string; isActive: boolean } }[];
    totalCount: number;
  };
}

export interface CreateFollowUpResponse {
  createClientFollowUp?: FollowUpMutationPayload;
}

export interface UpdateFollowUpResponse {
  updateClientFollowUp?: FollowUpMutationPayload;
}

export interface FollowUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Agendamento existente = corrigir a ficha (motivo, observações, pedido,
   * responsável). O DIA não muda aqui: muda em "Reagendar", que guarda o
   * de-para na linha do tempo.
   */
  followUp?: FollowUp | null;
  /** Cliente já definido (aba do cliente, pedido). Ausente = o modal pergunta. */
  clientId?: string;
  clientName?: string;
  /** Pedido já definido (agendado a partir do pedido). */
  orderId?: string;
  orderLabel?: string;
  /**
   * O retorno combinado ("volte dia X") que este contato vai atender —
   * agendado a partir da linha do retorno nas Pendências. Concluir o contato
   * resolve o retorno.
   */
  returnItemId?: string;
  /** "20/10/2026" — o dia do retorno, para a frase do modal. */
  returnLabel?: string;
  /** Dia já sugerido (ISO) — o do retorno combinado, quando vem dele. */
  defaultDueDate?: string;
  /**
   * Quem vai fazer, já sugerido — a pessoa cuja agenda está aberta. Só o
   * gestor escolhe responsável; para o vendedor é sempre ele mesmo.
   */
  defaultResponsible?: { id: string; name: string } | null;
  /** Depois de salvar, com o id do agendamento. */
  onSaved?: (id: string) => void;
}
