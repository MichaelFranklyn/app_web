import { BRT_TIME_ZONE, formatDate } from "@/utils/format/date";
import {
  exportPortalOrderPdf,
  PORTAL_ORDER_PDF_COLUMNS,
  PortalPdfBrand,
} from "../../orderPdf";
import { PortalSentOrderDetail } from "../../interface";
import {
  sentOrderFileName,
  sentOrderLabel,
  sentOrderStage,
  sentOrderTotal,
} from "../utils";

export type SentOrderPdfBrand = PortalPdfBrand;

export const SENT_ORDER_PDF_COLUMNS = PORTAL_ORDER_PDF_COLUMNS;

/** As linhas de contexto sob a faixa: o que o papel é, e que o preço é estimado. */
export const sentOrderPdfContext = (order: PortalSentOrderDetail): string[] => {
  const lines = [
    `Fábrica: ${order.factoryName}`,
    `Enviado em ${formatDate(order.createdAt, "", { timeZone: BRT_TIME_ZONE })} · ${sentOrderLabel(sentOrderStage(order))}`,
  ];
  if (order.sellerName) lines.push(`Representante: ${order.sellerName}`);
  if (order.clientRequestNote) lines.push(`Recado: ${order.clientRequestNote}`);
  lines.push("Valores estimados — o representante confirma preço e condição.");
  return lines;
};

/** O pedido enviado (ainda orçamento) em PDF — total estimado. */
export const exportSentOrderPdf = (
  order: PortalSentOrderDetail,
  brand: SentOrderPdfBrand
): Promise<void> =>
  exportPortalOrderPdf(
    {
      title: "PEDIDO ENVIADO",
      total: sentOrderTotal(order),
      context: sentOrderPdfContext(order),
      items: order.items,
      totalsLabel: "Total estimado",
      fileName: sentOrderFileName(order),
    },
    brand
  );
