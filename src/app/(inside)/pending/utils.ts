import { SelectOption } from "@/components/Input";
import { TitleColor } from "@/components/Title";
import { FieldConfig } from "@/hooks/useTableFilters";
import { ThemeColor } from "@/lib/theme";
import { formatDate } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";

import {
  PendingItem,
  PendingPriority,
  PendingReason,
  PendingType,
} from "./interface";

export const ITEMS_PER_PAGE = 20;

/**
 * Sem período escolhido, o backend mostra o que já venceu e o que vence nos
 * próximos dias (`DEFAULT_HORIZON_DAYS` em `pending_items/rules.py`). O número
 * mora lá; aqui ele só aparece na frase que explica o recorte.
 */
export const DEFAULT_HORIZON_DAYS = 7;

/**
 * Os filtros da tela, no formato do `useTableFilters` — é ele que os guarda na
 * URL, para o recorte sobreviver à ida a um pedido e à volta.
 *
 * Todos `select` (sem debounce): tipo e vendedor são escolhas, e as duas pontas
 * do período são datas prontas, não texto sendo digitado.
 */
export const PENDING_FILTER_FIELDS: Record<string, FieldConfig> = {
  type: { type: "select", queryField: "type" },
  seller: { type: "select", queryField: "seller" },
  dueFrom: { type: "select", queryField: "dueFrom" },
  dueTo: { type: "select", queryField: "dueTo" },
};

/** A ordem dos contadores — a mesma em que os tipos desempatam na lista. */
export const PENDING_TYPE_ORDER: PendingType[] = [
  "VISIT_OVERDUE",
  "RETURN_SCHEDULED",
  "ORDER_STALLED",
  "CLIENT_NO_CONTACT",
];

export const PENDING_TYPE_LABEL: Record<PendingType, string> = {
  VISIT_OVERDUE: "Visitas atrasadas",
  RETURN_SCHEDULED: "Retornos combinados",
  ORDER_STALLED: "Pedidos parados",
  CLIENT_NO_CONTACT: "Clientes sem contato",
};

/** O nome de UMA pendência do tipo — o que vai na linha da tabela. */
export const PENDING_TYPE_SINGULAR: Record<PendingType, string> = {
  VISIT_OVERDUE: "Visita atrasada",
  RETURN_SCHEDULED: "Retorno combinado",
  ORDER_STALLED: "Pedido parado",
  CLIENT_NO_CONTACT: "Cliente sem contato",
};

export const PENDING_PRIORITY_LABEL: Record<PendingPriority, string> = {
  HIGH: "Alta",
  MEDIUM: "Média",
  LOW: "Baixa",
};

export const PENDING_PRIORITY_COLOR: Record<PendingPriority, ThemeColor> = {
  HIGH: "red",
  MEDIUM: "amber",
  LOW: "neutral",
};

/** O que cada degrau quer dizer — vai no `title` do selo. */
export const PENDING_PRIORITY_HINT: Record<PendingPriority, string> = {
  HIGH: "Resolva hoje: o prazo já passou há tempo, ou o cliente está esperando.",
  MEDIUM: "Resolva nesta semana: o prazo acabou de vencer ou está chegando.",
  LOW: "Pode esperar: ainda está no prazo, ou não trava ninguém.",
};

export const pendingTypeOptions = (): SelectOption[] =>
  PENDING_TYPE_ORDER.map((type) => ({
    value: type,
    label: PENDING_TYPE_LABEL[type],
  }));

const days = (n: number): string => (n === 1 ? "1 dia" : `${n} dias`);

/** Só o que a frase precisa — o resto da linha vem do backend. */
type ReasonInput = Pick<
  PendingItem,
  | "reason"
  | "referenceDate"
  | "isRemote"
  | "allowanceDays"
  | "isEstimated"
  | "daysLate"
  | "scheduledDate"
>;

/**
 * O MOTIVO da pendência, na língua de quem vende — com a CONTA inteira.
 *
 * Quando o prazo sai de uma régua do sistema (7 dias para faturar, 30 sem
 * contato), a régua vai escrita: "confirmado há 9 dias; prazo considerado: 7
 * dias". Régua que não aparece vira "o sistema acha que está atrasado", e
 * ninguém confia numa lista que não sabe explicar.
 *
 * O texto mora aqui, e não no backend (mesma divisão de /insights): de lá vêm o
 * motivo, as datas e a régua; a frase é decisão de tela.
 */
export const reasonText = (item: ReasonInput): string => {
  const when = formatDate(item.referenceDate, "");
  const rule = item.allowanceDays ?? 0;
  // Dias desde o fato = a folga da régua + o atraso sobre o prazo.
  const ago = days(Math.max(0, rule + item.daysLate));
  const byReason: Record<PendingReason, string> = {
    VISIT_UNANSWERED: `${
      item.isRemote ? "A ligação" : "A visita"
    } de ${when} ficou sem resposta — diga o que aconteceu.`,
    RETURN_DATE: `O cliente pediu para voltar neste dia (combinado em ${when}).`,
    WANTS_VISIT: `O cliente pediu uma visita na ligação de ${when}.`,
    DRAFT_STALE: `Orçamento de ${when}, há ${ago} sem virar pedido. Prazo considerado: ${days(rule)}.`,
    PENDING_INVOICE: item.isEstimated
      ? `Pedido de ${when}, há ${ago}, e a fábrica ainda não faturou. Prazo considerado: ${days(rule)}, estimado — a data da confirmação não foi registrada, então contamos da data do pedido.`
      : `Confirmado em ${when}, há ${ago}, e a fábrica ainda não faturou. Prazo considerado: ${days(rule)}.`,
    DELIVERY_UNCONFIRMED: `Faturado em ${when}, há ${ago}. Prazo de entrega considerado: ${days(rule)} — pergunte ao cliente se a mercadoria chegou.`,
    NO_CONTACT: `Último contato (visita, ligação ou pedido) em ${when}, há ${ago}. Régua: ${days(rule)} sem contato.`,
    NEVER_CONTACTED: `Na carteira desde ${when} e nunca teve visita, ligação nem pedido registrado. Régua: ${days(rule)} sem contato.`,
  };
  return byReason[item.reason] + scheduledNote(item.scheduledDate);
};

/**
 * A agenda que NÃO dispensou a pendência: o contato está marcado, mas depois
 * desta semana — então a falta de contato de hoje continua valendo.
 */
const scheduledNote = (scheduledDate: string | null): string =>
  scheduledDate
    ? ` Já há contato marcado para ${formatDate(scheduledDate)}, mas é depois desta semana.`
    : "";

/**
 * O `title` do selo de prioridade: o que o degrau quer dizer e QUANDO ele
 * sobe. "Vira Alta com 3 dias de atraso" é o que explica por que a visita de
 * ontem é Média e a de anteontem, Alta.
 */
export const priorityHint = (
  item: Pick<PendingItem, "priority" | "highAfterDays">
): string => {
  const hint = PENDING_PRIORITY_HINT[item.priority];
  if (item.priority === "HIGH") return hint;
  if (item.highAfterDays === null) return `${hint} Este tipo não chega a Alta.`;
  return `${hint} Vira Alta com ${days(item.highAfterDays)} de atraso.`;
};

/** "venceu há 3 dias" · "vence hoje" · "vence em 2 dias". */
export const dueLabel = (daysLate: number): string => {
  if (daysLate === 0) return "vence hoje";
  if (daysLate > 0) return `venceu há ${days(daysLate)}`;
  return daysLate === -1 ? "vence amanhã" : `vence em ${days(-daysLate)}`;
};

/** Vencido em vermelho, hoje em âmbar, no prazo sem cor. */
export const dueTone = (daysLate: number): TitleColor => {
  if (daysLate > 0) return "red";
  return daysLate === 0 ? "amber" : "muted";
};

/** Para onde a linha leva — escrito, para ninguém clicar no escuro. */
export const destinationLabel = (type: PendingType): string => {
  if (type === "VISIT_OVERDUE") return "Responder na rota do dia";
  return type === "ORDER_STALLED" ? "Abrir o pedido" : "Abrir o cliente";
};

/** O complemento sob o nome do cliente: a fábrica e o valor do pedido. */
export const clientDetail = (
  item: Pick<PendingItem, "factoryName" | "amount">
): string | null => {
  const parts = [
    item.factoryName,
    item.amount ? formatMoney(item.amount) : null,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : null;
};

/** A cor do contador: vermelho se há alta prioridade, âmbar se há algo. */
export const countTone = (count: number, highCount: number): TitleColor => {
  if (highCount > 0) return "red";
  return count > 0 ? "amber" : "muted";
};

/**
 * As variables da consulta a partir dos filtros da URL.
 *
 * Uma função só para o cliente e para o SSR (`page.tsx` chama com `{}` e página
 * 1): as variables precisam bater byte a byte, senão o cache semeado no
 * servidor nunca é aproveitado.
 *
 * `canSelectSeller` falso derruba o `seller` da URL: o backend já o ignora para
 * o vendedor, mas mandar faria a consulta dele divergir da semeada à toa.
 */
export const pendingVariables = (
  values: Record<string, string>,
  page: number,
  canSelectSeller = true
) => ({
  types: values.type ? [values.type] : null,
  sellerId: canSelectSeller && values.seller ? values.seller : null,
  dueFrom: values.dueFrom || null,
  dueTo: values.dueTo || null,
  offset: (Math.max(1, page) - 1) * ITEMS_PER_PAGE,
  limit: ITEMS_PER_PAGE,
});

/**
 * A frase que diz QUAL recorte a lista está mostrando.
 *
 * Existe porque o padrão não é óbvio: sem período, a lista não mostra "tudo" —
 * mostra o vencido e a próxima semana. Um retorno combinado para daqui a dois
 * meses está fora, e sem a frase pareceria que o sistema o perdeu.
 */
export const scopeNote = (values: Record<string, string>): string => {
  const from = values.dueFrom ? formatDate(values.dueFrom) : null;
  const to = values.dueTo ? formatDate(values.dueTo) : null;
  if (from && to) return `Mostrando o que tem prazo de ${from} a ${to}.`;
  if (from) return `Mostrando o que tem prazo a partir de ${from}.`;
  if (to) return `Mostrando o que tem prazo até ${to}.`;
  return `Mostrando o que já venceu e o que vence nos próximos ${DEFAULT_HORIZON_DAYS} dias. Para ver mais adiante, escolha um período em Filtros.`;
};

/** Há algum filtro valendo? Muda a mensagem de lista vazia. */
export const hasActiveFilter = (values: Record<string, string>): boolean =>
  Object.keys(PENDING_FILTER_FIELDS).some((key) => !!values[key]);
