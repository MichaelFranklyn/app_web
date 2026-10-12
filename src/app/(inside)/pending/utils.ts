import { TitleColor } from "@/components/Title";
import { FieldConfig } from "@/hooks/useTableFilters";
import { ThemeColor } from "@/lib/theme";
import { formatDate, getBrtTodayIso } from "@/utils/format/date";
import { formatMoney } from "@/utils/format/masks";
import { greetingFor } from "@/utils/greeting";
import {
  CalendarClock,
  ClipboardList,
  MapPinOff,
  PackageX,
  PhoneCall,
  Receipt,
  Repeat,
  UserX,
  type LucideIcon,
} from "lucide-react";

import {
  PendingItem,
  PendingPriority,
  PendingReason,
  PendingType,
  PendingTypeCount,
  PendingWhen,
} from "./interface";

export const ITEMS_PER_PAGE = 20;

/** Quantas pendências o cartão mostra antes de abrir a lista do assunto. */
export const SAMPLE_SIZE = 3;

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
  // O assunto ABERTO: o cartão cuja lista está na página. Na URL para o link do
  // aviso (`/pending?type=…`) e quem volta de um pedido caírem na mesma lista.
  type: { type: "select", queryField: "type" },
  // Herança da tela antiga, que separava compromissos de cobranças: o link
  // guardado com `section=charges` abre o cartão dos boletos (ver `openTypeOf`).
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

/** É um tipo que esta tela conhece? (o `?type=` da URL vem de fora) */
export const isPendingType = (
  value: string | undefined
): value is PendingType =>
  !!value && PENDING_TYPE_ORDER.includes(value as PendingType);

/**
 * O assunto cuja lista está aberta na página, ou `null` (só os cartões).
 *
 * `section=charges` é o link da tela antiga para os boletos: continua abrindo
 * o que a pessoa procurava, agora como o cartão de boletos vencidos.
 */
export const openTypeOf = (
  values: Record<string, string>
): PendingType | null => {
  if (isPendingType(values.type)) return values.type;
  return values.section === "charges" ? "INSTALLMENT_OVERDUE" : null;
};

/**
 * O que cada cartão diz do seu assunto: o ícone e POR QUE aquilo é pendência.
 *
 * A frase mora aqui, como em /opportunities: o backend manda o número e os
 * casos; explicar o assunto na língua de quem vende é decisão de tela.
 */
export const PENDING_TYPE_COPY: Record<
  PendingType,
  { icon: LucideIcon; why: string; listAction: string }
> = {
  VISIT_OVERDUE: {
    icon: ClipboardList,
    why: "Estavam na rotina, o dia passou e ninguém disse o que houve. Responda na rota para o histórico do cliente ficar certo.",
    listAction: "Ver as visitas",
  },
  FOLLOW_UP: {
    icon: PhoneCall,
    why: "Contatos que alguém combinou de fazer com o cliente e que vencem neste período.",
    listAction: "Ver os contatos",
  },
  RETURN_SCHEDULED: {
    icon: CalendarClock,
    why: "O cliente pediu para voltar num dia, ou pediu uma visita, e isso ainda não foi cumprido.",
    listAction: "Ver os retornos",
  },
  VISIT_FREQUENCY: {
    icon: Repeat,
    why: "O ciclo de visita do cliente já passou e não há visita marcada nesta semana.",
    listAction: "Ver os clientes",
  },
  ORDER_STALLED: {
    icon: PackageX,
    why: "Orçamento sem resposta, pedido que a fábrica não faturou ou entrega sem confirmação.",
    listAction: "Ver os pedidos",
  },
  INSTALLMENT_OVERDUE: {
    icon: Receipt,
    why: "Boletos vencidos, um por pedido. Ficam aqui até o pagamento ser baixado no pedido — conferir a comissão não é pagar.",
    listAction: "Ver os boletos",
  },
  CLIENT_NO_CONTACT: {
    icon: UserX,
    why: "Clientes da carteira sem visita, ligação nem pedido fechado há mais de 30 dias.",
    listAction: "Ver os clientes",
  },
  ADDRESS_ISSUE: {
    icon: MapPinOff,
    why: "O mapa não achou o endereço. Não têm prazo, mas ficam fora da rota até o cadastro ser corrigido.",
    listAction: "Ver os endereços",
  },
};

/**
 * Os cartões da tela: um por assunto que TEM pendência, na ordem fixa dos
 * tipos (e não pelo tamanho do número — o cartão não muda de lugar de um dia
 * para o outro). O assunto aberto fica mesmo zerado: a lista dele está na
 * página, e sumir com o cartão deixaria a lista sem dono.
 */
export const visibleTypeCounts = (
  counts: PendingTypeCount[],
  open: PendingType | null = null
): PendingTypeCount[] => {
  const byType = new Map(counts.map((row) => [row.type, row]));
  return PENDING_TYPE_ORDER.flatMap((type) => {
    const row = byType.get(type);
    if (row && (row.count > 0 || type === open)) return [row];
    return [];
  });
};

/** A linha sob o título do cartão: quantas não podem esperar. */
export const cardSubtitle = (
  row: Pick<PendingTypeCount, "type" | "count" | "highCount">
): string => {
  if (row.type === "ADDRESS_ISSUE") return "sem prazo — trava a rotina";
  if (row.highCount === 0) return "nenhuma de prioridade alta";
  if (row.highCount === row.count) {
    return row.count === 1 ? "de prioridade alta" : "todas de prioridade alta";
  }
  return `${row.highCount} de prioridade alta`;
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

/** O recorte que os cartões e a lista dividem: vendedor, período e faixa. */
const scopeVariables = (
  values: Record<string, string>,
  canSelectSeller: boolean
) => ({
  sellerId: canSelectSeller && values.seller ? values.seller : null,
  dueFrom: values.dueFrom || null,
  dueTo: values.dueTo || null,
  when: values.when || null,
});

/**
 * As variables do RESUMO (cartões + contadores) a partir dos filtros da URL.
 *
 * Uma função só para o cliente e para o SSR (`page.tsx` chama com `{}`): as
 * variables precisam bater byte a byte, senão o cache semeado no servidor
 * nunca é aproveitado.
 *
 * `canSelectSeller` falso derruba o `seller` da URL: o backend já o ignora para
 * o vendedor, mas mandar faria a consulta dele divergir da semeada à toa.
 *
 * Sem `types`: os contadores por tipo já ignoram esse filtro, e os de prazo
 * passam a contar a tela inteira — não mudam quando um cartão é aberto.
 */
export const pendingSummaryVariables = (
  values: Record<string, string>,
  canSelectSeller = true
) => ({
  ...scopeVariables(values, canSelectSeller),
  sampleSize: SAMPLE_SIZE,
});

/** As variables da LISTA de um assunto: o mesmo recorte, um tipo, uma página. */
export const pendingCasesVariables = (
  values: Record<string, string>,
  type: PendingType,
  page: number,
  canSelectSeller = true
) => ({
  ...scopeVariables(values, canSelectSeller),
  types: [type],
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
  if (from && to) return `Contando o que tem prazo de ${from} a ${to}.`;
  if (from) return `Contando o que tem prazo a partir de ${from}.`;
  if (to) return `Contando o que tem prazo até ${to}.`;
  return `Contando o que já venceu, o que vence nos próximos ${DEFAULT_HORIZON_DAYS} dias e o cadastro a corrigir (sem prazo). Para ver mais adiante, escolha um período em Filtros.`;
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

/**
 * Há algum filtro valendo? Muda a mensagem de tela vazia. O assunto aberto não
 * conta: ele escolhe qual lista se vê, não o que os cartões contam.
 */
export const hasActiveFilter = (values: Record<string, string>): boolean =>
  ["when", "seller", "dueFrom", "dueTo"].some((key) => !!values[key]);
