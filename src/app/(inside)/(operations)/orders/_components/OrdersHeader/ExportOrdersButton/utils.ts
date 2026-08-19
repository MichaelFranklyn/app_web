import { clientName, factoryName } from "@/utils/company";
import { formatDate } from "@/utils/format/date";
import { formatAmount } from "@/utils/format/masks";
import { Order } from "../../../interface";
import { orderStatusLabel } from "../../../utils";

export const EXPORT_HEADERS = [
  "Pedido",
  "Data do pedido",
  "Cliente",
  "Nome fantasia",
  "Fábrica",
  "Vendedor",
  "Situação",
  "Faturado em",
  // Mercadoria, sem IPI nem imposto embutido: é o que a coluna da tela mostra
  // e a base sobre a qual a fábrica calcula a comissão.
  "Valor sem impostos (R$)",
  "Comissão (R$)",
];

/**
 * Uma linha de planilha por pedido, nas mesmas colunas em que a tela os mostra.
 *
 * Dinheiro sai sem o "R$" e no formato brasileiro ("1.234,56"): assim o Excel
 * pt-BR entende as células como número e a pessoa consegue somar a coluna —
 * que é a razão de baixar a planilha em vez do PDF.
 */
export const buildExportRows = (orders: Order[]): string[][] =>
  orders.map((order) => [
    order.id.slice(0, 8).toUpperCase(),
    formatDate(order.orderDate, ""),
    // Célula vazia, não "—": na planilha o travessão viraria texto a limpar.
    order.client ? clientName(order.client) : "",
    order.client?.nomeFantasia ?? "",
    order.factory ? factoryName(order.factory) : "",
    order.seller?.name ?? "",
    orderStatusLabel(order.status),
    formatDate(order.invoicedAt, ""),
    formatAmount(order.totalAmount),
    formatAmount(order.commissionAmount),
  ]);
