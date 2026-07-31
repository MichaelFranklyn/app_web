import { KpiItem } from "@/components/Card/Kpi/Root/interface";
import { formatMoney } from "@/utils/format/masks";
import type { OrderStatus, OrdersStats } from "./interface";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "Orçamento",
  SENT: "Orçamento enviado",
  CONFIRMED: "Confirmado",
  INVOICED: "Faturado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

/** Cor do Badge por status: o que ainda dá trabalho fica em destaque. */
export const ORDER_STATUS_TONE: Record<
  OrderStatus,
  "subtle" | "neutral" | "blue" | "green" | "red"
> = {
  DRAFT: "subtle",
  SENT: "subtle",
  CONFIRMED: "blue",
  INVOICED: "neutral",
  DELIVERED: "green",
  CANCELLED: "red",
};

export const buildOrderKpis = (stats: OrdersStats): KpiItem[] => {
  // Defensivo: se o back não devolver `orderStats` (hiccup/edge de loading),
  // degrada para zeros em vez de derrubar a página inteira.
  const {
    totalOrders = 0,
    totalAmount = "0",
    avgTicket = "0",
  } = stats.orderStats ?? {};

  return [
    {
      label: "Total de pedidos",
      value: String(totalOrders),
      delta: "pedidos da empresa",
      status: "atencao",
    },
    {
      label: "Valor total",
      value: formatMoney(totalAmount),
      delta: "soma de todos os pedidos",
      positive: totalOrders > 0,
      status: "ok",
    },
    {
      label: "Ticket médio",
      value: formatMoney(avgTicket),
      delta: "valor médio por pedido",
      status: "neutral",
    },
  ];
};
