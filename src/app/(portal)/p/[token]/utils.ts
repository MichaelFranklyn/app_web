import { formatDate } from "@/utils/format/date";
import { PortalOrder, PortalOrderStatus, PortalProfile } from "./interface";
import { formatQuantity } from "@/utils/format/masks";

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

/** O que entra na conta do total. A lista de pedidos feitos (`portalOrders`) não traz `taxAmount`; a de "Pedidos" (`portalSentOrders`) e os detalhes trazem. */
export interface OrderAmounts {
  totalAmount: string;
  ipiAmount: string;
  taxAmount?: string;
}

/**
 * Total a pagar: mercadoria + imposto embutido + IPI.
 *
 * O sistema separa as partes porque a comissão do vendedor incide só sobre a
 * mercadoria. Para quem paga a conta essa distinção não existe — o valor da
 * nota é a soma —, então é ela que aparece em destaque, com a composição no
 * resumo financeiro. Mesma conta do "Total do pedido" do detalhe do sistema.
 */
export const portalOrderTotal = (order: OrderAmounts): number =>
  Number(order.totalAmount) +
  Number(order.taxAmount ?? 0) +
  Number(order.ipiAmount);

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

/**
 * Subtotal de uma linha: mercadoria + imposto embutido, SEM o IPI — a coluna
 * Subtotal do detalhe de pedido do sistema. O IPI tem coluna própria e entra
 * no total do resumo.
 */
export const itemLineTotal = (item: {
  subtotal: string;
  taxAmount: string;
}): number => Number(item.subtotal) + Number(item.taxAmount);

/** Frete como o sistema escreve no resumo. O backend devolve "fob"/"cif". */
export const freightLabel = (
  freightType: string | null | undefined
): string => {
  const kind = freightType?.toUpperCase();
  if (kind === "FOB") return "FOB — por conta do cliente";
  if (kind === "CIF") return "CIF — entrega pela fábrica";
  return "—";
};

const INSTALLMENT_LABEL: Record<string, string> = {
  PENDING: "A pagar",
  PAID: "Pago",
  CANCELLED: "Cancelada",
};

export const installmentLabel = (status: string): string =>
  INSTALLMENT_LABEL[status] ?? status;

/**
 * O que o formulário de pedido do portal (`/pedido`) manda: só as linhas
 * MARCADAS.
 *
 * A quantidade vem preenchida com a última compra, e é por isso que ela sozinha
 * não basta — senão o envio pediria a lista inteira. Quem decide é o "Pedir".
 * Quantidade vazia, zero ou ilegível na linha marcada também fica de fora: o
 * cliente marcou e apagou, e "zero de X" não é pedido.
 */
export function pickedEntries(
  formData: FormData
): Array<{ productId: string; quantity: string }> {
  const picked: Array<{ productId: string; quantity: string }> = [];
  for (const [key] of formData.entries()) {
    if (!key.startsWith("pick__")) continue;
    const productId = key.replace("pick__", "");
    const raw = String(formData.get(`qty__${productId}`) ?? "")
      .trim()
      .replace(",", ".");
    const quantity = Number(raw);
    if (raw === "" || !Number.isFinite(quantity) || quantity <= 0) continue;
    picked.push({ productId, quantity: raw });
  }
  return picked;
}

/** "12" em vez de "12.0000": o Decimal do backend chega com as casas todas. */
export function formatUnits(value: string | null): string {
  if (value === null) return "";
  return formatQuantity(value, 3);
}

/**
 * O nome da primeira tela do portal — no menu, no título e no esqueleto. Era
 * "Minhas compras", mas a lista de pedidos foi para "Pedidos"; o que sobrou é o
 * resumo dos últimos 12 meses.
 */
export const PORTAL_HOME_TITLE = "Resumo";

/**
 * A linha sob o título do Resumo: quem é o cliente, onde fica e quem o atende —
 * é por ela que ele confere que o link é mesmo dele.
 */
export function portalGreeting(profile: PortalProfile): string {
  const city = [profile.clientCity, profile.clientState]
    .filter(Boolean)
    .join(" - ");
  return [profile.clientName, city, `atendido por ${profile.companyName}`]
    .filter(Boolean)
    .join(" · ");
}
