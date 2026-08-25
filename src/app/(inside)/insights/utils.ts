import { formatMoney } from "@/utils/format/masks";
import {
  Banknote,
  CalendarClock,
  CalendarOff,
  ClipboardList,
  LucideIcon,
  MapPin,
  MapPinOff,
  PackageCheck,
  Receipt,
  Search,
  Target,
  Truck,
  UserMinus,
  Users,
} from "lucide-react";

import {
  Insight,
  InsightCaseReason,
  InsightGroup,
  InsightKind,
} from "./interface";

/**
 * O TOM de cada pendência: o que custa dinheiro agora é urgente; o que trava o
 * mês pede atenção; o que é só sinal fica informativo. A cor não decora a tela,
 * ela ordena a leitura de quem tem quinze minutos entre uma visita e outra.
 */
export type InsightTone = "urgent" | "attention" | "info";

export const GROUP_LABEL: Record<InsightGroup, string> = {
  WALLET: "Carteira",
  ORDERS: "Pedidos",
  MONEY: "Dinheiro",
  GOALS: "Metas",
};

interface InsightCopy {
  icon: LucideIcon;
  tone: InsightTone;
  /** Manchete com o número — é a linha que a pessoa lê primeiro. */
  title: (insight: Insight) => string;
  /** POR QUE isso atrapalha a venda. É o que transforma aviso em decisão. */
  why: (insight: Insight) => string;
  /** O que fazer, e onde. */
  action: string;
  href: string;
}

const plural = (count: number, one: string, many: string) =>
  count === 1 ? one : many;

/**
 * O texto de cada insight mora AQUI, e não no backend, pela mesma razão que
 * `FEATURE_LABEL`: o backend responde quantos casos existem; como se fala com
 * quem vende é decisão de produto, e ela muda muito mais vezes que a consulta.
 */
export const INSIGHT_COPY: Record<InsightKind, InsightCopy> = {
  INSTALLMENT_OVERDUE: {
    icon: Banknote,
    tone: "urgent",
    title: ({ count }) =>
      `${count} ${plural(count, "boleto vencido", "boletos vencidos")} e não ${plural(count, "pago", "pagos")}`,
    why: ({ amount }) =>
      `São ${formatMoney(Number(amount ?? 0))} que o cliente já deveria ter pago. Boleto vencido trava a comissão daquela venda, e se virar calote o que já foi repassado volta como desconto no seu fechamento. Cobrar cedo custa um telefonema; estornar depois custa o mês.`,
    action: "Ver as comissões",
    href: "/commissions",
  },
  CLIENT_OVERDUE: {
    icon: UserMinus,
    tone: "urgent",
    title: ({ count }) =>
      `${count} ${plural(count, "cliente passou", "clientes passaram")} do próprio ritmo de compra`,
    why: () =>
      "Cada um deles já deveria ter comprado de novo — pelo intervalo que ele mesmo pratica, não por uma média geral. Cliente que atrasa e não recebe ligação não fica parado: ele repõe a prateleira com outro representante, e voltar depois custa desconto.",
    action: "Ver na carteira",
    href: "/clients",
  },
  GOAL_BEHIND: {
    icon: Target,
    tone: "attention",
    title: ({ count }) =>
      `${count} ${plural(count, "meta do mês está", "metas do mês estão")} atrás do ritmo`,
    why: ({ amount, daysLeft }) => {
      const missing = Number(amount ?? 0);
      const days = daysLeft ?? 0;
      const perDay = days > 0 ? missing / days : missing;
      return days > 0
        ? `Faltam ${formatMoney(missing)} para fechar o combinado e restam ${days} ${plural(days, "dia útil", "dias úteis")}. Dá ${formatMoney(perDay)} por dia — é esse o número que decide o mês, e ele só cresce se a decisão for adiada.`
        : `Faltam ${formatMoney(missing)} para fechar o combinado e o mês acabou.`;
    },
    action: "Ver as metas",
    href: "/goals",
  },
  PRIORITY_OFF_ROUTE: {
    icon: MapPin,
    tone: "attention",
    title: ({ count, blockedCount }) =>
      count > 0
        ? `${count} ${plural(count, "cliente prioritário ficou", "clientes prioritários ficaram")} fora da rotina desta semana`
        : `${blockedCount} ${plural(blockedCount, "cliente prioritário está travado", "clientes prioritários estão travados")} por uma pendência`,
    /**
     * Duas histórias diferentes, e é o motivo que separa as duas.
     *
     * Quando há caso sem explicação, o assunto é a rotina. Quando TODOS têm
     * explicação, o assunto é a pendência que os prende — e mandar rever a
     * rotina seria mandar o vendedor procurar um erro que não existe. Era o que
     * o cartão fazia: numa base real, os nove "prioritários ignorados" eram
     * nove descartes deliberados do próprio motor.
     */
    why: ({ count, blockedCount }) =>
      count > 0
        ? `O sistema pontuou esses clientes como os mais urgentes da semana e eles não entraram no roteiro. A pontuação já pesa quanto tempo faz que compraram, o quanto costumam comprar e o que deve estar acabando na loja — ignorá-la é escolher visitar quem estava no caminho, não quem estava pronto para comprar.${blockedCount > 0 ? ` Outros ${blockedCount} estão de fora por um motivo do sistema; abra a lista para ver qual.` : ""}`
        : "Nenhum deles foi esquecido: o sistema os tirou da rotina de propósito, cada um por um motivo — quase sempre um pedido em aberto naquela fábrica, que não recomenda visita até a entrega ser confirmada. Enquanto o pedido não anda, o cliente não volta ao roteiro por mais alto que fique a pontuação dele. Abra a lista para ver o motivo de cada um.",
    action: "Ajustar a rotina",
    href: "/routines",
  },
  VISIT_OVERDUE: {
    icon: CalendarClock,
    tone: "attention",
    title: ({ count }) =>
      `${count} ${plural(count, "cliente está", "clientes estão")} com a visita vencida`,
    why: () =>
      "Passou da frequência combinada para esses clientes. A frequência não é burocracia: foi ela que manteve o pedido chegando no intervalo certo, e cada semana a mais aumenta a chance de encontrar a prateleira já reposta.",
    action: "Reprogramar visitas",
    href: "/routines",
  },
  PENDING_INVOICE: {
    icon: Receipt,
    tone: "attention",
    title: ({ count }) =>
      `${count} ${plural(count, "pedido confirmado espera", "pedidos confirmados esperam")} faturamento`,
    why: ({ amount }) =>
      `São ${formatMoney(Number(amount ?? 0))} em mercadoria que a fábrica ainda não faturou. A comissão só começa a contar a partir do faturamento, então cada dia parado aqui é um dia a mais para o dinheiro chegar — e é a você que o cliente vai cobrar o prazo.`,
    action: "Ver o que falta faturar",
    href: "/orders?tab=pending",
  },
  DRAFT_STALE: {
    icon: ClipboardList,
    tone: "attention",
    title: ({ count }) =>
      `${count} ${plural(count, "pedido parado", "pedidos parados")} em rascunho há mais de uma semana`,
    why: ({ amount }) =>
      `Rascunho não é venda: enquanto não vira pedido, a fábrica não separa, não fatura e a comissão não nasce. São ${formatMoney(Number(amount ?? 0))} em mercadoria esperando uma decisão — fechar ou apagar, mas não ficar no meio.`,
    action: "Abrir os pedidos",
    href: "/orders",
  },
  DELIVERY_UNCONFIRMED: {
    icon: PackageCheck,
    tone: "info",
    title: ({ count }) =>
      `${count} ${plural(count, "pedido faturado está", "pedidos faturados estão")} sem a entrega confirmada`,
    why: () =>
      "O prazo de entrega venceu e ninguém confirmou o recebimento. Além de ser a hora de conferir se a mercadoria chegou mesmo, é a confirmação que abastece o estoque estimado do cliente — sem ela o sistema calcula a próxima visita com uma prateleira que não existe mais.",
    action: "Conferir as entregas",
    href: "/orders",
  },
  NO_VISIT_30D: {
    icon: Users,
    tone: "info",
    title: ({ count }) =>
      `${count} ${plural(count, "cliente está", "clientes estão")} sem visita há mais de 30 dias`,
    why: () =>
      "São clientes da carteira que ninguém procurou no último mês. Nem todos precisam de visita mensal — mas o que fica tempo demais sem contato sai da lista de compra sem avisar, e só se descobre quando o pedido não vem.",
    action: "Ver na carteira",
    href: "/clients",
  },
};

/**
 * A ordem da tela: dinheiro parado e cliente sumindo primeiro; sinal de fundo
 * por último. Fixa, e não pelo tamanho do número — cem clientes sem visita há
 * um mês não são mais urgentes que um boleto vencido, e ordenar por contagem
 * empurraria justamente o que precisa de ação para o fim da lista.
 */
const KIND_ORDER: InsightKind[] = [
  "INSTALLMENT_OVERDUE",
  "CLIENT_OVERDUE",
  "GOAL_BEHIND",
  "PRIORITY_OFF_ROUTE",
  "VISIT_OVERDUE",
  "PENDING_INVOICE",
  "DRAFT_STALE",
  "DELIVERY_UNCONFIRMED",
  "NO_VISIT_30D",
];

/**
 * O TOM de uma pendência já medida.
 *
 * Vem do tipo, com uma exceção: a pendência cujos casos o sistema TODOS explica
 * cai para "de olho". Ela não pede decisão de ninguém hoje — pede que uma outra
 * pendência (o pedido parado) seja resolvida —, e deixá-la em âmbar competindo
 * com o que precisa de ação treina a pessoa a ignorar o âmbar.
 */
export const toneOf = (insight: Insight): InsightTone =>
  insight.count === 0 && insight.blockedCount > 0
    ? "info"
    : INSIGHT_COPY[insight.kind].tone;

export const sortInsights = (insights: Insight[]): Insight[] =>
  [...insights].sort(
    (a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind)
  );

/**
 * As três faixas de urgência, na ordem em que a tela as empilha. É a resposta à
 * pergunta que traz alguém aqui: "o que eu faço PRIMEIRO?".
 */
export const TONE_ORDER: InsightTone[] = ["urgent", "attention", "info"];

export const TONE_SECTION: Record<
  InsightTone,
  { title: string; hint: string }
> = {
  urgent: {
    title: "Resolver hoje",
    hint: "Custa dinheiro enquanto espera.",
  },
  attention: {
    title: "Esta semana",
    hint: "Ainda dá para virar o mês com isso resolvido.",
  },
  info: {
    title: "De olho",
    hint: "Nada urgente — é o pano de fundo que vira problema se ninguém olhar.",
  },
};

/** Os insights de uma faixa de urgência, já na ordem da tela. */
export const insightsByTone = (
  insights: Insight[],
  tone: InsightTone
): Insight[] =>
  sortInsights(insights).filter((insight) => toneOf(insight) === tone);

/** O dinheiro parado somado — boleto vencido, pedido sem faturar, meta a fazer. */
export const totalAmount = (insights: Insight[]): number =>
  insights.reduce((sum, insight) => sum + Number(insight.amount ?? 0), 0);

/** Quantos casos existem ao todo — a frase do topo da tela. */
export const totalCases = (insights: Insight[]): number =>
  insights.reduce(
    (sum, insight) => sum + insight.count + insight.blockedCount,
    0
  );

/** Quantas pendências urgentes — é o que decide o tom do resumo. */
export const urgentCount = (insights: Insight[]): number =>
  insights.filter((insight) => toneOf(insight) === "urgent").length;

/**
 * Quantos casos o cartão mostra no número grande, e como se chamam.
 *
 * Um "0" enorme e vermelho num cartão que existe justamente porque há cinco
 * clientes travados seria a leitura errada de relance. Quando não há nada a
 * decidir, o número passa a ser o dos travados e o rótulo muda junto.
 */
export const cardCount = (
  insight: Insight
): { value: number; label: string } => {
  const onlyBlocked = insight.count === 0 && insight.blockedCount > 0;
  const value = onlyBlocked ? insight.blockedCount : insight.count;
  return {
    value,
    label: onlyBlocked
      ? value === 1
        ? "travado"
        : "travados"
      : value === 1
        ? "caso"
        : "casos",
  };
};

/** Total de casos por trás do cartão — é o tamanho da lista do "ver todos". */
export const caseTotal = (insight: Insight): number =>
  insight.count + insight.blockedCount;

interface ReasonCopy {
  icon: LucideIcon;
  /** Rótulo curto, na etiqueta ao lado do nome do cliente. */
  label: string;
  /** O que fazer para destravar — a frase que transforma motivo em tarefa. */
  hint: string;
}

/**
 * O motivo de o motor não ter recomendado o cliente, em português de quem vende.
 *
 * Mora aqui pela mesma razão que o resto da copy: o backend responde qual regra
 * excluiu o cliente; como se explica isso a quem está no carro entre duas
 * visitas é decisão de produto, e muda muito mais vezes que a regra.
 */
export const REASON_COPY: Record<InsightCaseReason, ReasonCopy> = {
  ORDER_OPEN: {
    icon: Truck,
    label: "Pedido em aberto",
    hint: "O sistema não manda visitar uma fábrica de que o cliente acabou de comprar. Fature o pedido e confirme a entrega — aí ele volta para a rotina.",
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
    hint: "Sem o endereço no mapa não dá para montar rota até ele. Corrija o endereço no cadastro do cliente.",
  },
  NO_ROOM: {
    icon: Search,
    label: "Não coube na semana",
    hint: "Nenhuma regra o excluiu — a semana fechou antes de chegar nele. É este que vale rever na rotina.",
  },
};
