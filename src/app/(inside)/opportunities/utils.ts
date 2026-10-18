import { formatDate } from "@/utils/format/date";
import {
  Ban,
  CalendarClock,
  CalendarOff,
  LucideIcon,
  MapPin,
  MapPinOff,
  RefreshCcw,
  Search,
  Truck,
} from "lucide-react";

import {
  Opportunity,
  OpportunityCase,
  OpportunityCaseReason,
  OpportunityKind,
} from "./interface";

/** A frase do topo — diz, antes de tudo, que isto não é lista de tarefas. */
export const OPPORTUNITIES_TAGLINE =
  "Onde vale concentrar suas próximas ações comerciais.";

interface OpportunityCopy {
  icon: LucideIcon;
  /** O nome do cartão — o assunto, sem número. */
  title: string;
  /** A frase sob o número: o que ele conta. */
  countLabel: (count: number) => string;
  /** POR QUE vale agir. É o que transforma o número em escolha. */
  why: (opportunity: Opportunity) => string;
  /** O botão que abre a lista na própria página. */
  listAction: string;
  /** Para onde se vai planejar — o segundo botão. */
  planAction: { label: string; href: string } | null;
}

const plural = (count: number, one: string, many: string) =>
  count === 1 ? one : many;

/**
 * O texto de cada oportunidade mora AQUI, e não no backend: o backend responde
 * quantos casos existem; como se fala com quem vende é decisão de produto.
 *
 * Nada de "atrasado" nem de vermelho: oportunidade é escolha, não cobrança. O
 * que é cobrança (pedido parado, boleto, visita vencida) mora em Pendências.
 */
export const OPPORTUNITY_COPY: Record<OpportunityKind, OpportunityCopy> = {
  CLIENT_OVERDUE: {
    icon: RefreshCcw,
    title: "Clientes no momento de recomprar",
    countLabel: (count) =>
      plural(count, "cliente já passou", "clientes já passaram") +
      " do próprio intervalo de compra",
    why: () =>
      "Cada cliente é medido contra o próprio ritmo: quem compra a cada 20 dias e não pede há 35 já deveria ter comprado de novo. É a hora de oferecer — antes que outro representante reponha a prateleira.",
    listAction: "Ver clientes",
    planAction: null,
  },
  PRIORITY_OFF_ROUTE: {
    icon: MapPin,
    title: "Clientes prioritários fora da rotina",
    countLabel: (count) =>
      plural(count, "cliente ficou", "clientes ficaram") +
      " fora da rotina desta semana",
    /**
     * Duas histórias, e é o motivo que separa as duas: com caso sem explicação
     * o assunto é a rotina; com TODOS explicados, é a pendência que os prende
     * — e mandar rever a rotina seria procurar um erro que não existe.
     */
    why: ({ count, blockedCount }) =>
      count > 0
        ? `O sistema pontuou estes clientes como os mais urgentes da semana e eles não entraram no roteiro.${blockedCount > 0 ? ` Outros ${blockedCount} estão de fora por um motivo do sistema — a lista diz qual.` : ""}`
        : "Nenhum foi esquecido: o sistema os tirou da rotina de propósito, quase sempre por um pedido em aberto naquela fábrica. A lista mostra o motivo de cada um.",
    listAction: "Ver quem ficou de fora",
    planAction: { label: "Revisar planejamento", href: "/agenda" },
  },
};

/**
 * A ordem da tela: quem está pronto para comprar primeiro; quem ficou fora do
 * planejamento depois. Fixa, e não pelo tamanho do número.
 */
const KIND_ORDER: OpportunityKind[] = ["CLIENT_OVERDUE", "PRIORITY_OFF_ROUTE"];

export const sortOpportunities = (items: Opportunity[]): Opportunity[] =>
  items
    .filter((item) => item.kind in OPPORTUNITY_COPY)
    .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind));

/** É um tipo que esta tela conhece? (o `?open=` da URL vem de fora) */
export const isOpportunityKind = (
  value: string | null
): value is OpportunityKind => !!value && value in OPPORTUNITY_COPY;

/**
 * O número grande do cartão, e como se chama.
 *
 * Quando nada depende de decisão (todos os casos explicados pelo sistema), o
 * número passa a ser o dos explicados — um "0" num cartão que existe por
 * causa de cinco clientes seria a leitura errada de relance.
 */
export const cardCount = (
  opportunity: Opportunity
): { value: number; label: string } => {
  const onlyBlocked = opportunity.count === 0 && opportunity.blockedCount > 0;
  if (onlyBlocked) {
    const value = opportunity.blockedCount;
    return {
      value,
      label: plural(value, "cliente explicado", "clientes explicados"),
    };
  }
  return {
    value: opportunity.count,
    label: OPPORTUNITY_COPY[opportunity.kind].countLabel(opportunity.count),
  };
};

/** Total de casos por trás do cartão — é o tamanho da lista. */
export const caseTotal = (opportunity: Opportunity): number =>
  opportunity.count + opportunity.blockedCount;

/**
 * O que já está marcado para o cliente — "Contato agendado para 14/10". É o
 * que impede o vendedor de repetir a ação: a oportunidade virou compromisso, e
 * o compromisso aparece em Pendências quando chegar o dia.
 */
export const scheduledNote = (
  item: Pick<OpportunityCase, "nextFollowUpDate" | "nextVisitDate">
): string | null => {
  const notes = [
    item.nextFollowUpDate
      ? `Contato agendado para ${formatDate(item.nextFollowUpDate)}`
      : null,
    item.nextVisitDate
      ? `Visita marcada para ${formatDate(item.nextVisitDate)}`
      : null,
  ].filter(Boolean);
  return notes.length > 0 ? notes.join(" · ") : null;
};

interface ReasonCopy {
  icon: LucideIcon;
  /** Rótulo curto, na etiqueta ao lado do nome do cliente. */
  label: string;
  /** O que fazer para destravar — a frase que transforma motivo em tarefa. */
  hint: string;
}

/**
 * O motivo de o motor não ter recomendado o cliente, em português de quem vende.
 */
export const REASON_COPY: Record<OpportunityCaseReason, ReasonCopy> = {
  CLIENT_NEGATIVE: {
    icon: Ban,
    label: "Negativado na fábrica",
    hint: "A fábrica suspendeu o crédito dele. Enquanto isso valer, visitar não adianta: ela não aceita pedido novo desse cliente. Quem destrava é a fábrica — depois, retire a negativação no vínculo.",
  },
  ORDER_OPEN: {
    icon: Truck,
    label: "Pedido em aberto",
    hint: "O sistema não manda visitar uma fábrica de que o cliente acabou de comprar. Clique na linha para abrir o pedido: fature e confirme a entrega — aí o cliente volta para a rotina.",
  },
  VISIT_PENDING: {
    icon: CalendarClock,
    label: "Visita já marcada",
    hint: "Ele já está na agenda, em outra rotina. Não é ausência: é compromisso que ainda não aconteceu.",
  },
  DEFERRED: {
    icon: CalendarOff,
    label: "Cliente pediu para adiar",
    hint: "Ele mesmo disse para não passar agora. O sistema respeita a data que ele deu.",
  },
  NO_GEOCODE: {
    icon: MapPinOff,
    label: "Endereço não localizado",
    hint: "Sem o endereço no mapa não dá para montar rota até ele. Corrija o endereço no cadastro do cliente — ele também aparece em Pendências.",
  },
  NO_ROOM: {
    icon: Search,
    label: "Não coube na semana",
    hint: "Nenhuma regra o excluiu — a semana fechou antes de chegar nele. É este que vale rever no planejamento.",
  },
};
