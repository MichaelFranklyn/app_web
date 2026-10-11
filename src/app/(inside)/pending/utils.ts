import { SelectOption } from "@/components/Input";
import { TitleColor } from "@/components/Title";
import { FieldConfig } from "@/hooks/useTableFilters";
import { ThemeColor } from "@/lib/theme";
import { formatDate, getBrtTodayIso } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { greetingFor } from "@/utils/greeting";

import {
  PendingItem,
  PendingPriority,
  PendingReason,
  PendingType,
  PendingSection,
  PendingTypeCount,
  PendingWhen,
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
  // Compromissos × cobranças — na URL para o link do aviso (e quem volta de um
  // pedido) cair na seção certa.
  section: { type: "select", queryField: "section" },
  // A faixa de prazo dos contadores do topo — vai na URL como os filtros, para
  // "Atrasadas" sobreviver à ida a um pedido e à volta.
  when: { type: "select", queryField: "when" },
  seller: { type: "select", queryField: "seller" },
  dueFrom: { type: "select", queryField: "dueFrom" },
  dueTo: { type: "select", queryField: "dueTo" },
};

/** A ordem dos contadores — a mesma em que os tipos desempatam na lista. */
export const PENDING_TYPE_ORDER: PendingType[] = [
  "VISIT_OVERDUE",
  "FOLLOW_UP",
  "RETURN_SCHEDULED",
  "VISIT_FREQUENCY",
  "ORDER_STALLED",
  "INSTALLMENT_OVERDUE",
  "CLIENT_NO_CONTACT",
  "ADDRESS_ISSUE",
];

/**
 * Três assuntos de visita, três nomes que não se confundem: a visita marcada
 * que ficou SEM RESPOSTA, a FREQUÊNCIA do cliente que venceu (ninguém marcou
 * nada) e o cliente SEM CONTATO nenhum há 30 dias.
 */
export const PENDING_TYPE_LABEL: Record<PendingType, string> = {
  VISIT_OVERDUE: "Visitas sem resposta",
  FOLLOW_UP: "Contatos agendados",
  RETURN_SCHEDULED: "Retornos combinados",
  VISIT_FREQUENCY: "Frequência de visita vencida",
  ORDER_STALLED: "Pedidos parados",
  INSTALLMENT_OVERDUE: "Boletos vencidos",
  CLIENT_NO_CONTACT: "Clientes sem contato",
  ADDRESS_ISSUE: "Endereços a corrigir",
};

/** O nome de UMA pendência do tipo — o que vai na linha da tabela. */
export const PENDING_TYPE_SINGULAR: Record<PendingType, string> = {
  VISIT_OVERDUE: "Visita sem resposta",
  FOLLOW_UP: "Contato agendado",
  RETURN_SCHEDULED: "Retorno combinado",
  VISIT_FREQUENCY: "Frequência de visita vencida",
  ORDER_STALLED: "Pedido parado",
  INSTALLMENT_OVERDUE: "Boleto vencido",
  CLIENT_NO_CONTACT: "Cliente sem contato",
  ADDRESS_ISSUE: "Endereço a corrigir",
};

/**
 * Os tipos de cada seção. Cobrança é a única de DINHEIRO a receber: numa base
 * real eram 278 pedidos com boleto vencido, que na mesma lista empurravam
 * visitas e retornos para a página 10. A seção separa sem rebaixar.
 */
export const CHARGE_TYPES: PendingType[] = ["INSTALLMENT_OVERDUE"];

export const COMMITMENT_TYPES: PendingType[] = PENDING_TYPE_ORDER.filter(
  (type) => !CHARGE_TYPES.includes(type)
);

/**
 * A seção aberta. O link com `type=INSTALLMENT_OVERDUE` (aviso antigo, filtro
 * guardado) cai em Cobranças mesmo sem `section` na URL.
 */
export const sectionOf = (values: Record<string, string>): PendingSection =>
  values.section === "charges" ||
  CHARGE_TYPES.includes(values.type as PendingType)
    ? "charges"
    : "commitments";

/** Quantas pendências em cada seção — vai no rótulo do botão da seção. */
export const sectionCounts = (
  counts: PendingTypeCount[]
): Record<PendingSection, number> => {
  const sum = (types: PendingType[]) =>
    counts
      .filter((row) => types.includes(row.type))
      .reduce((total, row) => total + row.count, 0);
  return { commitments: sum(COMMITMENT_TYPES), charges: sum(CHARGE_TYPES) };
};

/** Os contadores do topo, na ordem da leitura: o que venceu, hoje, a semana. */
export const PENDING_WHEN_ORDER: PendingWhen[] = [
  "OVERDUE",
  "TODAY",
  "NEXT_7_DAYS",
  "NO_DUE",
];

export const PENDING_WHEN_LABEL: Record<PendingWhen, string> = {
  OVERDUE: "Atrasadas",
  TODAY: "Hoje",
  NEXT_7_DAYS: "Próximos 7 dias",
  LATER: "Mais adiante",
  NO_DUE: "Sem prazo",
};

/** O que cada contador conta — vai no `title` do cartão. */
export const PENDING_WHEN_HINT: Record<PendingWhen, string> = {
  OVERDUE: "O prazo já passou. Clique para ver só estas.",
  TODAY: "O prazo é hoje. Clique para ver só estas.",
  NEXT_7_DAYS:
    "O prazo cai de amanhã até daqui a 7 dias. Clique para ver só estas.",
  LATER: "O prazo é depois dos próximos 7 dias.",
  NO_DUE:
    "Cadastro a corrigir: não vence, mas trava a rotina enquanto estiver errado. Clique para ver só estas.",
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

/** As opções do filtro de tipo, com quantas há de cada no recorte atual. */
export const pendingTypeOptions = (
  counts: PendingTypeCount[] = [],
  types: PendingType[] = COMMITMENT_TYPES
): SelectOption[] => {
  const byType = new Map(counts.map((row) => [row.type, row.count]));
  return types.map((type) => ({
    value: type,
    label: byType.has(type)
      ? `${PENDING_TYPE_LABEL[type]} (${byType.get(type)})`
      : PENDING_TYPE_LABEL[type],
  }));
};

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
  | "note"
  | "installmentCount"
  | "amount"
>;

/**
 * O MOTIVO da pendência, na língua de quem vende — com a CONTA inteira.
 *
 * Quando o prazo sai de uma régua do sistema (7 dias para faturar, 30 sem
 * contato), a régua vai escrita: "confirmado há 9 dias; prazo considerado: 7
 * dias". Régua que não aparece vira "o sistema acha que está atrasado", e
 * ninguém confia numa lista que não sabe explicar.
 *
 * O texto mora aqui, e não no backend (mesma divisão de /opportunities): de lá vêm o
 * motivo, as datas e a régua; a frase é decisão de tela.
 */
export const reasonText = (item: ReasonInput): string => {
  const when = formatDate(item.referenceDate, "");
  const rule = item.allowanceDays ?? 0;
  // Dias desde o fato = a folga da régua + o atraso sobre o prazo.
  const ago = days(Math.max(0, rule + (item.daysLate ?? 0)));
  const byReason: Record<PendingReason, string> = {
    VISIT_UNANSWERED: `${
      item.isRemote ? "A ligação" : "A visita"
    } de ${when} ficou sem resposta — diga o que aconteceu.`,
    RETURN_DATE: `O cliente pediu para voltar neste dia (combinado em ${when}).`,
    WANTS_VISIT: `O cliente pediu uma visita na ligação de ${when}.`,
    FOLLOW_UP_DUE: `${item.note ?? "Contato agendado"} — agendado em ${when}.`,
    DRAFT_STALE: `Orçamento de ${when}, há ${ago} sem virar pedido. Prazo considerado: ${days(rule)}.`,
    PENDING_INVOICE: item.isEstimated
      ? `Pedido de ${when}, há ${ago}, e a fábrica ainda não faturou. Prazo considerado: ${days(rule)}, estimado — a data da confirmação não foi registrada, então contamos da data do pedido.`
      : `Confirmado em ${when}, há ${ago}, e a fábrica ainda não faturou. Prazo considerado: ${days(rule)}.`,
    DELIVERY_UNCONFIRMED: `Faturado em ${when}, há ${ago}. Prazo de entrega considerado: ${days(rule)} — pergunte ao cliente se a mercadoria chegou.`,
    NO_CONTACT: `Último contato (visita, ligação ou pedido) em ${when}, há ${ago}. Régua: ${days(rule)} sem contato.`,
    NEVER_CONTACTED: `Na carteira desde ${when} e nunca teve visita, ligação nem pedido registrado. Régua: ${days(rule)} sem contato.`,
    FREQUENCY_DUE: `Última visita em ${when}, há ${ago}. Frequência de visita deste cliente: a cada ${days(rule)} — e não há visita marcada nesta semana.`,
    INSTALLMENT_UNPAID: `${parcels(item.installmentCount)}${item.amount ? `, ${formatMoney(item.amount)} em aberto` : ""}. ${item.installmentCount && item.installmentCount > 1 ? "A mais antiga venceu" : "Venceu"} em ${when}, há ${days(Math.max(0, item.daysLate ?? 0))}. Fica aqui até o pagamento ser baixado no pedido — conferir a comissão não tira o boleto da lista.`,
    LOCATION_MISSING:
      "O mapa não encontrou o endereço deste cliente. Sem ele, o cliente não entra na rota — corrija rua, número e CEP no cadastro.",
    LOCATION_APPROXIMATE:
      "O mapa achou só a região, não a porta da loja. Assim o cliente nunca abre um dia de rota — corrija rua, número e CEP no cadastro.",
  };
  return byReason[item.reason] + scheduledNote(item.scheduledDate);
};

/** "1 parcela vencida" · "3 parcelas vencidas". */
const parcels = (count: number | null): string =>
  count && count > 1 ? `${count} parcelas vencidas` : "1 parcela vencida";

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

/** "venceu há 3 dias" · "vence hoje" · "vence em 2 dias" · "sem prazo". */
export const dueLabel = (daysLate: number | null): string => {
  if (daysLate === null) return "sem prazo";
  if (daysLate === 0) return "vence hoje";
  if (daysLate > 0) return `venceu há ${days(daysLate)}`;
  return daysLate === -1 ? "vence amanhã" : `vence em ${days(-daysLate)}`;
};

/** Vencido em vermelho, hoje em âmbar, no prazo (ou sem prazo) sem cor. */
export const dueTone = (daysLate: number | null): TitleColor => {
  if (daysLate === null) return "muted";
  if (daysLate > 0) return "red";
  return daysLate === 0 ? "amber" : "muted";
};

/**
 * A AÇÃO da linha — escrita, para ninguém clicar no escuro. É para onde a
 * linha leva: a conclusão acontece lá (no pedido, no contato, no cadastro),
 * nunca aqui.
 */
const ACTION_LABEL: Record<PendingType, string> = {
  VISIT_OVERDUE: "Responder na rota",
  FOLLOW_UP: "Abrir contato",
  RETURN_SCHEDULED: "Abrir cliente",
  VISIT_FREQUENCY: "Abrir cliente",
  ORDER_STALLED: "Abrir pedido",
  INSTALLMENT_OVERDUE: "Abrir pedido",
  CLIENT_NO_CONTACT: "Abrir cliente",
  ADDRESS_ISSUE: "Corrigir cadastro",
};

export const destinationLabel = (type: PendingType): string =>
  ACTION_LABEL[type];

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
  // Sempre uma lista de tipos: a seção é um recorte por tipo, feito no
  // backend (os contadores de prazo acompanham a seção).
  types:
    sectionOf(values) === "charges"
      ? CHARGE_TYPES
      : values.type
        ? [values.type]
        : COMMITMENT_TYPES,
  sellerId: canSelectSeller && values.seller ? values.seller : null,
  dueFrom: values.dueFrom || null,
  dueTo: values.dueTo || null,
  when: values.when || null,
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
  return `Mostrando o que já venceu, o que vence nos próximos ${DEFAULT_HORIZON_DAYS} dias e o cadastro a corrigir (sem prazo). Para ver mais adiante, escolha um período em Filtros.`;
};

/**
 * A mensagem pronta do pós-venda: o cliente reconhece o pedido pela fábrica e
 * pela data, e a pergunta é aberta o bastante para ele contar um problema.
 */
export const postSaleMessage = (
  item: Pick<PendingItem, "factoryName" | "orderDate">,
  hour: number = new Date().getHours()
): string => {
  const pedido = item.factoryName
    ? `o pedido da ${item.factoryName}`
    : "o pedido";
  const quando = item.orderDate
    ? ` feito em ${formatDate(item.orderDate)}`
    : "";
  return `Olá, ${greetingFor(hour)}! Tudo bem? Passando para saber se ${pedido}${quando} já foi entregue e se chegou tudo certo. Qualquer coisa, estou à disposição.`;
};

/**
 * O dia sugerido ao agendar o contato de um retorno: o combinado; se já
 * passou (ou não há), hoje — agendar no passado é recusado.
 */
export const followUpDefaultDate = (dueDate: string | null): string => {
  const today = getBrtTodayIso();
  return dueDate && dueDate >= today ? dueDate : today;
};

/** Há algum filtro valendo? Muda a mensagem de lista vazia. */
/** Há algum filtro valendo? (a seção não conta: ela é onde se está) */
export const hasActiveFilter = (values: Record<string, string>): boolean =>
  Object.keys(PENDING_FILTER_FIELDS).some(
    (key) => key !== "section" && !!values[key]
  );
