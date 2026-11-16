import { formatDate } from "@/utils/format/date";
import { formatMoney, formatNumber } from "@/utils/format/masks";
import { formatOrderNumber } from "@/utils/orderNumber";
import { PortalOrderDetail } from "../../interface";
import { freightLabel, portalOrderTotal, portalStatusLabel } from "../../utils";

/** A entrega só pode ser confirmada no pedido faturado que ainda não chegou. */
export const canConfirmDelivery = (
  order: Pick<PortalOrderDetail, "status" | "deliveredAt">
): boolean => order.status === "INVOICED" && !order.deliveredAt;

/** As linhas de contexto do PDF: fábrica, data, situação, condição e frete. */
export const portalOrderPdfContext = (order: PortalOrderDetail): string[] => {
  const lines = [
    `Fábrica: ${order.factoryName}`,
    `Pedido de ${formatDate(order.orderDate)} · ${portalStatusLabel(order.status)}`,
  ];
  if (order.paymentTermName) lines.push(`Prazo: ${order.paymentTermName}`);
  if (order.freightType)
    lines.push(`Frete: ${freightLabel(order.freightType)}`);
  if (order.sellerName) lines.push(`Representante: ${order.sellerName}`);
  return lines;
};

/**
 * O resumo do email e do WhatsApp: o número (é por ele que o representante
 * acha o pedido), a fábrica, a data, os produtos com a quantidade e o total.
 */
export const portalOrderShareText = (order: PortalOrderDetail): string =>
  [
    `Olá${order.sellerName ? `, ${order.sellerName}` : ""}! Sobre o pedido ${formatOrderNumber(order.number)}:`,
    "",
    `Fábrica: ${order.factoryName}`,
    `Pedido de ${formatDate(order.orderDate)} · ${portalStatusLabel(order.status)}`,
    "",
    ...order.items.map(
      (item) =>
        `• ${formatNumber(Number(item.quantity))} × ${item.productName}${item.sku ? ` (${item.sku})` : ""}`
    ),
    "",
    `Total: ${formatMoney(portalOrderTotal(order))}`,
  ].join("\n");

export const portalOrderMailSubject = (order: PortalOrderDetail): string =>
  `Pedido ${formatOrderNumber(order.number)} — ${order.factoryName}`;

/** `pedido-<numero>-<fabrica>.pdf`. */
export const portalOrderFileName = (order: PortalOrderDetail): string => {
  const factory = order.factoryName
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `pedido-${order.number}${factory ? `-${factory}` : ""}.pdf`;
};
