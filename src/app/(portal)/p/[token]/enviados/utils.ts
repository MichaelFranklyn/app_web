import { ThemeColor } from "@/lib/theme";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import {
  PortalOrderKind,
  PortalSentOrder,
  PortalSentOrderDetail,
  PortalSentOrderStatus,
} from "../interface";
import { portalOrderTotal } from "../utils";

/**
 * Em que pé está o pedido, do jeito que o CLIENTE pergunta: "ele já viu?",
 * "virou pedido?". São quatro respostas — o status interno tem seis valores,
 * mas rascunho e enviado são a mesma coisa para quem está do lado de fora.
 */
export type SentOrderStage = "waiting" | "seen" | "ordered" | "cancelled";

const ORDERED: PortalSentOrderStatus[] = ["CONFIRMED", "INVOICED", "DELIVERED"];

export const sentOrderStage = (
  order: Pick<PortalSentOrder, "status" | "seenBySellerAt">
): SentOrderStage => {
  if (order.status === "CANCELLED") return "cancelled";
  if (ORDERED.includes(order.status)) return "ordered";
  return order.seenBySellerAt ? "seen" : "waiting";
};

const STAGE_LABEL: Record<SentOrderStage, string> = {
  waiting: "Aguardando o representante",
  seen: "Visto pelo representante",
  ordered: "Virou pedido",
  cancelled: "Não foi adiante",
};

/** Verde só quando virou pedido: é o único estado em que o cliente não espera nada. */
const STAGE_TONE: Record<SentOrderStage, ThemeColor> = {
  waiting: "neutral",
  seen: "blue",
  ordered: "green",
  cancelled: "red",
};

export const sentOrderLabel = (stage: SentOrderStage): string =>
  STAGE_LABEL[stage];

export const sentOrderTone = (stage: SentOrderStage): ThemeColor =>
  STAGE_TONE[stage];

/**
 * Data de um instante (`DateTime`) no fuso de Brasília.
 *
 * A tela é servida pelo servidor, que roda em UTC: um envio às 22h de segunda
 * sairia como terça sem o fuso explícito.
 */
export const formatBrtDate = (iso: string | null | undefined): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

/** A frase que explica a situação — o que já aconteceu e o que vem depois. */
export const sentOrderHint = (order: PortalSentOrder): string => {
  const seller = order.sellerName ?? "O representante";
  switch (sentOrderStage(order)) {
    case "seen":
      return `${seller} viu o seu pedido em ${formatBrtDate(order.seenBySellerAt)} e vai confirmar preço e condição com você.`;
    case "ordered":
      return `${seller} confirmou. O pedido está confirmado.`;
    case "cancelled":
      return "Este pedido não foi adiante. Fale com o seu representante para saber o motivo.";
    default:
      return `${seller} ainda não abriu. Quando abrir, aparece aqui.`;
  }
};

/** Mesma conta do pedido confirmado: mercadoria + imposto embutido + IPI. */
export const sentOrderTotal = (order: PortalSentOrder): number =>
  portalOrderTotal(order);

export const itemCountLabel = (count: number): string =>
  count === 1 ? "1 produto" : `${count} produtos`;

/** A data em que o cliente mandou, para o card e o cabeçalho. */
export const sentOrderDateLine = (order: PortalSentOrder): string =>
  `Enviado em ${formatBrtDate(order.createdAt)}`;

/**
 * O resumo que vai no email e no WhatsApp: fábrica, data e os produtos com a
 * quantidade — o que o representante precisa para achar o pedido. Preço fica
 * de fora: ele é estimado e quem fecha é o representante.
 */
export const sentOrderShareText = (order: PortalSentOrderDetail): string => {
  const lines = [
    `Olá${order.sellerName ? `, ${order.sellerName}` : ""}! Mandei um pedido pelo portal:`,
    "",
    `Fábrica: ${order.factoryName}`,
    sentOrderDateLine(order),
    "",
    ...order.items.map(
      (item) =>
        `• ${formatNumber(Number(item.quantity))} × ${item.productName}${item.sku ? ` (${item.sku})` : ""}`
    ),
  ];
  if (order.clientRequestNote)
    lines.push("", `Recado: ${order.clientRequestNote}`);
  lines.push("", `Total estimado: ${formatMoney(sentOrderTotal(order))}`);
  return lines.join("\n");
};

/** Assunto do email ao representante: fábrica e data do pedido. */
export const sentOrderMailSubject = (order: PortalSentOrderDetail): string =>
  `Pedido ${order.factoryName} — ${formatBrtDate(order.createdAt)}`;

/** Nome do arquivo do PDF: `pedido-<fabrica>-<dd-mm-aaaa>.pdf`. */
export const sentOrderFileName = (order: PortalSentOrder): string => {
  const factory = order.factoryName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `pedido-${factory || "portal"}-${formatBrtDate(order.createdAt).replaceAll("/", "-")}.pdf`;
};

/**
 * O recorte da lista na URL (`?tipo=`): tudo, só os pedidos feitos ou só os
 * orçamentos. Sem `tipo` (ou com um valor estranho) é tudo.
 */
export type SentOrdersTab = "todos" | "pedidos" | "orcamentos";

const TAB_KIND: Record<SentOrdersTab, PortalOrderKind> = {
  todos: "ALL",
  pedidos: "ORDER",
  orcamentos: "QUOTE",
};

export const parseSentOrdersTab = (raw: string | undefined): SentOrdersTab =>
  raw === "pedidos" || raw === "orcamentos" ? raw : "todos";

export const sentOrdersKind = (tab: SentOrdersTab): PortalOrderKind =>
  TAB_KIND[tab];

/** Página, recorte e busca da lista na URL (`?tipo=&busca=&p=`); o padrão fica de fora. */
export const sentOrdersHref = (
  token: string,
  page: number,
  tab: SentOrdersTab = "todos",
  search = ""
): string => {
  const query = new URLSearchParams();
  if (tab !== "todos") query.set("tipo", tab);
  if (search.trim()) query.set("busca", search.trim());
  if (page > 1) query.set("p", String(page));
  const params = query.toString();
  return params ? `/p/${token}/enviados?${params}` : `/p/${token}/enviados`;
};

/** Quantas páginas a lista tem (pelo menos uma). */
export const sentOrdersPageCount = (total: number, pageSize: number): number =>
  Math.max(1, Math.ceil(total / pageSize));

/** A linha da coluna "Pedido": número, ou "Orçamento" enquanto não confirmado. */
export const sentOrderNumberLine = (order: PortalSentOrder): string =>
  sentOrderStage(order) === "ordered"
    ? `Pedido nº ${order.number}`
    : `Orçamento nº ${order.number}`;

/**
 * Pedido feito (confirmado em diante, de qualquer origem) abre o detalhe do
 * pedido (`/pedidos/[id]`), com nota e boletos; orçamento abre a tela do que foi
 * pedido ao representante.
 */
export const sentOrderHref = (token: string, order: PortalSentOrder): string =>
  sentOrderStage(order) === "ordered"
    ? `/p/${token}/pedidos/${order.id}`
    : `/p/${token}/enviados/${order.id}`;
