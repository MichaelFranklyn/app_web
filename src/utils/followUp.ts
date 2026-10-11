/**
 * Vocabulário dos contatos agendados (follow-up) — tipos, rótulos e cores.
 *
 * Mora em `utils/` porque quatro telas distantes falam desta entidade: a lista
 * (`/follow-ups`), o agendamento aberto (`/follow-ups/[id]`), a aba do cliente
 * e o pedido. Rótulo duplicado é rótulo que diverge.
 *
 * Na tela a palavra é "contato agendado", não "follow-up": o público é de
 * vendedores de mais idade, e o termo em inglês é mais uma coisa a decifrar.
 */

import { ThemeColor } from "@/lib/theme";

export type FollowUpStatus = "SCHEDULED" | "DONE" | "CANCELLED";

/** O recorte da lista. Atrasado/hoje/próximos são LIDOS da data no backend. */
export type FollowUpSituation =
  | "OVERDUE"
  | "TODAY"
  | "UPCOMING"
  | "DONE"
  | "CANCELLED";

export type FollowUpEventKind =
  | "CREATED"
  | "RESCHEDULED"
  | "REASSIGNED"
  | "EDITED"
  | "DONE"
  | "CANCELLED";

interface Person {
  id: string;
  name: string;
}

/** Um "volte dia X" combinado com o cliente que o contato pode atender. */
export interface FollowUpReturn {
  itemId: string;
  returnDate: string;
  agreedOn: string;
}

export interface FollowUpEvent {
  id: string;
  kind: FollowUpEventKind;
  note: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  userFrom: Person | null;
  userTo: Person | null;
  author: Person | null;
  createdAt: string;
}

/** A linha da lista (e da aba do cliente). */
export interface FollowUp {
  id: string;
  clientId: string;
  companyClientId: string | null;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
  orderId: string | null;
  order: {
    id: string;
    orderDate: string;
    invoiceNumber: string | null;
  } | null;
  responsibleUserId: string | null;
  responsible: (Person & { isActive: boolean }) | null;
  dueDate: string;
  reason: string;
  notes: string | null;
  status: FollowUpStatus;
  situation: FollowUpSituation;
  daysLate: number;
  closedAt: string | null;
  outcome: string | null;
  rescheduleCount: number;
  /** Concluído como contato comercial (conta para "sem contato"). */
  isCommercial: boolean | null;
}

/** O agendamento aberto, com a história inteira. */
export interface FollowUpDetail extends FollowUp {
  createdBy: Person | null;
  previousId: string | null;
  next: { id: string; dueDate: string } | null;
  events: FollowUpEvent[];
  /** Padrão da pergunta "houve contato comercial?": sim para vendedor. */
  defaultCommercial: boolean;
  /** O retorno a que está vinculado — concluir já o atende. */
  linkedReturn: FollowUpReturn | null;
  /** O retorno em aberto que a pessoa pode confirmar ter atendido. */
  openReturn: FollowUpReturn | null;
  createdAt: string;
}

export const FOLLOW_UP_SITUATION_LABEL: Record<FollowUpSituation, string> = {
  OVERDUE: "Atrasados",
  TODAY: "Hoje",
  UPCOMING: "Próximos",
  DONE: "Concluídos",
  CANCELLED: "Cancelados",
};

/** O selo de UM agendamento. */
export const FOLLOW_UP_SITUATION_SINGULAR: Record<FollowUpSituation, string> = {
  OVERDUE: "Atrasado",
  TODAY: "Hoje",
  UPCOMING: "Agendado",
  DONE: "Concluído",
  CANCELLED: "Cancelado",
};

export const FOLLOW_UP_SITUATION_COLOR: Record<FollowUpSituation, ThemeColor> =
  {
    OVERDUE: "red",
    TODAY: "amber",
    UPCOMING: "blue",
    DONE: "green",
    CANCELLED: "neutral",
  };

/** O que cada recorte quer dizer — vai no `title` do selo e dos contadores. */
export const FOLLOW_UP_SITUATION_HINT: Record<FollowUpSituation, string> = {
  OVERDUE:
    "O dia combinado já passou e ninguém registrou o contato. Faça hoje, ou reagende dizendo o porquê.",
  TODAY: "Combinado para hoje.",
  UPCOMING: "Marcado para os próximos dias.",
  DONE: "O contato aconteceu e o que foi conversado está registrado.",
  CANCELLED: "Não vai mais acontecer — o motivo fica no histórico.",
};

export const FOLLOW_UP_EVENT_LABEL: Record<FollowUpEventKind, string> = {
  CREATED: "Agendado",
  RESCHEDULED: "Reagendado",
  REASSIGNED: "Transferido",
  EDITED: "Corrigido",
  DONE: "Concluído",
  CANCELLED: "Cancelado",
};

export const isFollowUpOpen = (status: FollowUpStatus): boolean =>
  status === "SCHEDULED";

/** "Ana" · "Ana (desativada)" — quem saiu da empresa fica marcado. */
export const responsibleName = (
  responsible: FollowUp["responsible"],
  fallback = "sem responsável"
): string => {
  if (!responsible) return fallback;
  return responsible.isActive
    ? responsible.name
    : `${responsible.name} (desativado)`;
};

const days = (n: number): string => (n === 1 ? "1 dia" : `${n} dias`);

/** "atrasado há 3 dias" · "hoje" · "amanhã" · "em 5 dias". */
export const followUpDueLabel = (daysLate: number): string => {
  if (daysLate === 0) return "hoje";
  if (daysLate > 0) return `atrasado há ${days(daysLate)}`;
  return daysLate === -1 ? "amanhã" : `em ${days(-daysLate)}`;
};

/**
 * A frase de um acontecimento da linha do tempo, montada do DE-PARA gravado —
 * é ele que responde "quantas vezes esse retorno foi empurrado, e para quando".
 */
export const followUpEventText = (
  event: FollowUpEvent,
  formatDate: (iso: string | null) => string
): string => {
  switch (event.kind) {
    case "CREATED":
      return `Agendado para ${formatDate(event.dateTo)}${
        event.userTo ? `, com ${event.userTo.name}` : ""
      }.`;
    case "RESCHEDULED":
      return `De ${formatDate(event.dateFrom)} para ${formatDate(event.dateTo)}.`;
    case "REASSIGNED":
      return `De ${event.userFrom?.name ?? "ninguém"} para ${
        event.userTo?.name ?? "ninguém"
      }.`;
    default:
      return "";
  }
};
