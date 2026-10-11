import { factoryName } from "@/utils/company";
import { extractSelectValue } from "@/utils/form";
import { formatDate, toIsoDate } from "@/utils/format/date";

/** O mesmo teto do backend (`REASON_MAX_LENGTH`): uma frase. */
export const REASON_MAX_LENGTH = 300;

/** "12/08/2026 · NF 1234 · Planalto" — o pedido como quem procura o reconhece. */
export const orderLabel = (order: {
  orderDate: string;
  invoiceNumber: string | null;
  factory?: {
    nickname: string | null;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
}): string =>
  [
    formatDate(order.orderDate),
    order.invoiceNumber ? `NF ${order.invoiceNumber}` : null,
    order.factory ? factoryName(order.factory) : null,
  ]
    .filter((part) => part && part !== "—")
    .join(" · ");

const text = (raw: unknown): string => String(raw ?? "").trim();

interface InputContext {
  /** Cliente fixado pela tela; senão vem do select do formulário. */
  clientId: string | null;
  /** Pedido fixado pela tela; senão vem do select do formulário. */
  orderId: string | null;
  /** Gestor escolhe o responsável; o vendedor agenda sempre para si. */
  canAssign: boolean;
  /** O retorno combinado que o contato vai atender, se veio dele. */
  returnItemId?: string | null;
}

/**
 * O que o formulário de agendar manda ao backend.
 *
 * Responsável vazio vai como `null` — o backend entende "quem está agendando".
 * Para o vendedor nem vai: ele agenda sempre para si, e mandar um id seria
 * pedir algo que o servidor ignora.
 */
export const createInput = (
  data: Record<string, unknown>,
  ctx: InputContext
) => ({
  clientId: ctx.clientId ?? (extractSelectValue(data.clientId) || null),
  // `toIsoDate`: o campo de data do FormBuilder não devolve ISO, e cortar a
  // string do jeito errado tira um dia da data.
  dueDate: data.dueDate ? toIsoDate(data.dueDate) : null,
  reason: text(data.reason),
  notes: text(data.notes) || null,
  orderId: ctx.orderId ?? (extractSelectValue(data.orderId) || null),
  responsibleUserId: ctx.canAssign
    ? extractSelectValue(data.responsibleUserId) || null
    : null,
  returnItemId: ctx.returnItemId ?? null,
});

/**
 * A correção da ficha: só motivo, observações, pedido e responsável. Nulo em
 * observações/pedido LIMPA o campo (desvincular o pedido é uma correção
 * legítima); o responsável só viaja quando quem corrige é gestor e escolheu
 * alguém — vazio não quer dizer "ninguém".
 */
export const updateInput = (
  data: Record<string, unknown>,
  canAssign: boolean
) => {
  const responsible = canAssign
    ? extractSelectValue(data.responsibleUserId)
    : "";
  return {
    reason: text(data.reason),
    notes: text(data.notes) || null,
    orderId: extractSelectValue(data.orderId) || null,
    ...(responsible ? { responsibleUserId: responsible } : {}),
  };
};
