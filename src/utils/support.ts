/**
 * Vocabulário dos atendimentos — tipos, rótulos e cores, num lugar só.
 *
 * Mora em `utils/` (e não na rota) pelo mesmo motivo de `utils/visit.ts`: três
 * telas distantes falam desta entidade — a fila do escritório (`/support`), o
 * caso aberto (`/support/[id]`) e a aba do cliente. Rótulo duplicado é rótulo
 * que divergiu: "aguardando fábrica" numa tela e "com a fábrica" na outra fazem
 * o usuário achar que são duas coisas.
 *
 * Os valores são os NOMES do enum no schema (maiúsculas), não os valores do
 * banco — é assim que o GraphQL os entrega.
 */

export type SupportStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "WAITING_FACTORY"
  | "WAITING_CLIENT"
  | "RESOLVED"
  | "CANCELLED";

export type SupportCategory =
  | "MERCHANDISE"
  | "PAYMENT"
  | "DELIVERY"
  | "PRICE"
  | "OTHER";

export type SupportPriority = "LOW" | "NORMAL" | "HIGH";

export type SupportUpdateKind =
  | "NOTE"
  | "CONTACT_CLIENT"
  | "CONTACT_FACTORY"
  | "STATUS_CHANGE";

export type SupportColor = "green" | "amber" | "red" | "neutral" | "blue";

/** Como cada situação é dita na tela — a frase, não o nome do enum. */
export const SUPPORT_STATUS_LABEL: Record<SupportStatus, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em andamento",
  WAITING_FACTORY: "Aguardando a fábrica",
  WAITING_CLIENT: "Aguardando o cliente",
  RESOLVED: "Resolvido",
  CANCELLED: "Cancelado",
};

export const SUPPORT_STATUS_COLOR: Record<SupportStatus, SupportColor> = {
  OPEN: "red",
  IN_PROGRESS: "amber",
  WAITING_FACTORY: "blue",
  WAITING_CLIENT: "blue",
  RESOLVED: "green",
  CANCELLED: "neutral",
};

/** O que fazer quando o caso está nessa situação — vira tooltip e ajuda. */
export const SUPPORT_STATUS_HINT: Record<SupportStatus, string> = {
  OPEN: "Registrado e ainda sem ninguém tratando. Assuma ou atribua a alguém.",
  IN_PROGRESS: "Alguém do escritório está resolvendo agora.",
  WAITING_FACTORY:
    "A bola está com a fábrica. Quem cobra é o escritório — registre cada cobrança.",
  WAITING_CLIENT:
    "Falta algo do cliente (uma foto, a nota, uma confirmação). Quem cobra é o vendedor.",
  RESOLVED: "Encerrado com solução. O histórico fica guardado.",
  CANCELLED: "Encerrado sem solução — desistiu-se, ou não era um problema.",
};

export const SUPPORT_CATEGORY_LABEL: Record<SupportCategory, string> = {
  MERCHANDISE: "Mercadoria",
  PAYMENT: "Pagamento",
  DELIVERY: "Entrega",
  PRICE: "Preço",
  OTHER: "Outro",
};

export const SUPPORT_PRIORITY_LABEL: Record<SupportPriority, string> = {
  LOW: "Baixa",
  NORMAL: "Normal",
  HIGH: "Alta",
};

export const SUPPORT_PRIORITY_COLOR: Record<SupportPriority, SupportColor> = {
  LOW: "neutral",
  NORMAL: "blue",
  HIGH: "red",
};

export const SUPPORT_UPDATE_KIND_LABEL: Record<SupportUpdateKind, string> = {
  NOTE: "Anotação",
  CONTACT_CLIENT: "Falei com o cliente",
  CONTACT_FACTORY: "Falei com a fábrica",
  STATUS_CHANGE: "Mudou de situação",
};

/** Situações que ainda pedem trabalho — o recorte da fila. */
export const OPEN_SUPPORT_STATUSES: SupportStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_FACTORY",
  "WAITING_CLIENT",
];

export const isSupportCaseOpen = (status: SupportStatus): boolean =>
  OPEN_SUPPORT_STATUSES.includes(status);

export interface SupportUpdate {
  id: string;
  caseId: string;
  kind: SupportUpdateKind;
  body: string;
  statusFrom: SupportStatus | null;
  statusTo: SupportStatus | null;
  author: { id: string; name: string } | null;
  createdAt: string;
}

export interface SupportCase {
  id: string;
  title: string;
  description: string | null;
  category: SupportCategory;
  status: SupportStatus;
  priority: SupportPriority;
  amount: string | null;
  reportedAt: string;
  resolvedAt: string | null;
  resolution: string | null;
  /** Dias que o cliente esperou (congela na resolução). */
  ageDays: number;
  isOpen: boolean;
  clientId: string;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
  factory: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    nickname: string | null;
  } | null;
  order: { id: string; orderDate: string; invoiceNumber: string | null } | null;
  seller: { id: string; name: string } | null;
  assignedTo: { id: string; name: string } | null;
  openedBy: { id: string; name: string } | null;
  lastUpdate: SupportUpdate | null;
  createdAt: string;
}

/**
 * "há 12 dias esperando" — a idade do caso dita como frase.
 *
 * Um número solto na coluna não diz se é bom ou ruim; a frase deixa claro que o
 * relógio é do CLIENTE, e é ele que a fila existe para não deixar correr.
 */
export const supportAgeLabel = (days: number, isOpen: boolean): string => {
  if (days <= 0) return isOpen ? "hoje" : "no mesmo dia";
  const label = days === 1 ? "1 dia" : `${days} dias`;
  return isOpen ? `${label} esperando` : `resolvido em ${label}`;
};
