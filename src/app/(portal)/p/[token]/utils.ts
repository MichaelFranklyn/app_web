import { formatDate } from "@/utils/format/date";
import { PortalOrder, PortalOrderStatus } from "./interface";

/**
 * O status como o CLIENTE o entende.
 *
 * Os nomes internos descrevem o andamento do pedido dentro do escritório
 * ("confirmado" quer dizer que o vendedor subiu o pedido para a fábrica), e
 * ninguém de fora tem por que conhecer esse vocabulário. Aqui cada estado vira
 * a resposta da única pergunta que o cliente está fazendo: e a minha mercadoria?
 */
const STATUS_LABEL: Record<PortalOrderStatus, string> = {
  CONFIRMED: "Pedido feito",
  INVOICED: "Nota emitida",
  DELIVERED: "Entregue",
};

const STATUS_HINT: Record<PortalOrderStatus, string> = {
  CONFIRMED: "O pedido está com a fábrica, aguardando o faturamento.",
  INVOICED: "A fábrica faturou. A mercadoria está a caminho.",
  DELIVERED: "A mercadoria chegou na sua loja.",
};

export const portalStatusLabel = (status: PortalOrderStatus): string =>
  STATUS_LABEL[status] ?? "Pedido feito";

export const portalStatusHint = (status: PortalOrderStatus): string =>
  STATUS_HINT[status] ?? "";

/** Verde só na entrega: é o único estado em que não falta nada acontecer. */
export const portalStatusTone = (
  status: PortalOrderStatus
): "green" | "blue" | "neutral" => {
  if (status === "DELIVERED") return "green";
  if (status === "INVOICED") return "blue";
  return "neutral";
};

/**
 * Total a pagar: mercadoria + IPI.
 *
 * O sistema separa os dois porque a comissão do vendedor incide só sobre a
 * mercadoria. Para quem paga a conta essa distinção não existe — o valor da
 * nota é a soma —, então é ela que aparece em destaque, com o IPI detalhado
 * embaixo quando houver.
 */
export const portalOrderTotal = (order: PortalOrder): number =>
  Number(order.totalAmount) + Number(order.ipiAmount);

export const hasIpi = (order: PortalOrder): boolean =>
  Number(order.ipiAmount) > 0;

/**
 * A linha de data que importa em cada estado — uma só, a mais recente.
 *
 * Mostrar as três datas de uma vez (pedido, faturamento, entrega) transforma o
 * card num extrato e faz o leitor procurar qual delas responde à pergunta dele.
 */
export const portalOrderDateLine = (order: PortalOrder): string => {
  if (order.status === "DELIVERED" && order.deliveredAt) {
    return `Entregue em ${formatDate(order.deliveredAt)}`;
  }
  if (order.status === "INVOICED") {
    if (order.estimatedDeliveryDate) {
      return `Previsão de entrega: ${formatDate(order.estimatedDeliveryDate)}`;
    }
    if (order.invoicedAt)
      return `Nota emitida em ${formatDate(order.invoicedAt)}`;
  }
  return `Pedido em ${formatDate(order.orderDate)}`;
};

/** Página vinda da URL. Lixo (`?p=abc`, `?p=-3`) volta para a primeira. */
export const parsePortalPage = (raw?: string | string[]): number => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
};

/** "2026-08-01" → "ago/26". Rótulo de eixo, onde o mês por extenso não cabe. */
export const monthShortLabel = (isoMonth: string): string => {
  const [year, month] = isoMonth.split("-");
  const index = Number(month) - 1;
  if (!MONTH_ABBR[index]) return isoMonth;
  return `${MONTH_ABBR[index]}/${year.slice(2)}`;
};

const MONTH_ABBR = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

/**
 * A leitura do estoque em palavras, a partir dos dias que faltam.
 *
 * O número sozinho não diz o que fazer: "12" é muito ou pouco? A frase resolve
 * isso na hora, e é o que o cliente lê antes de decidir se corrige o campo.
 */
export const stockUrgency = (
  daysRemaining: number | null
): { label: string; tone: "red" | "amber" | "green" | "neutral" } => {
  if (daysRemaining === null) {
    return { label: "Sem estimativa", tone: "neutral" };
  }
  if (daysRemaining <= 0) return { label: "Deve ter acabado", tone: "red" };
  if (daysRemaining <= 15) {
    return { label: `Acaba em ~${daysRemaining} dias`, tone: "amber" };
  }
  return { label: `Dura ~${daysRemaining} dias`, tone: "green" };
};

/**
 * Ordena o estoque pelo que está mais perto de acabar.
 *
 * Sem estimativa vai para o FIM, e não para o começo: o produto sobre o qual
 * nada se sabe não é urgente — é desconhecido —, e deixá-lo no topo empurraria
 * para baixo justamente as linhas que o cliente precisa corrigir primeiro.
 */
export const sortStockByUrgency = <T extends { daysRemaining: number | null }>(
  items: T[]
): T[] =>
  [...items].sort((a, b) => {
    if (a.daysRemaining === null && b.daysRemaining === null) return 0;
    if (a.daysRemaining === null) return 1;
    if (b.daysRemaining === null) return -1;
    return a.daysRemaining - b.daysRemaining;
  });

/** Total de uma linha do pedido: mercadoria + IPI, como sai na nota. */
export const itemLineTotal = (item: {
  subtotal: string;
  ipiAmount: string;
}): number => Number(item.subtotal) + Number(item.ipiAmount);

const INSTALLMENT_LABEL: Record<string, string> = {
  PENDING: "A pagar",
  PAID: "Pago",
  CANCELLED: "Cancelada",
};

export const installmentLabel = (status: string): string =>
  INSTALLMENT_LABEL[status] ?? status;
