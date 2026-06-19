import { KpiItem } from "@/components/Card/Kpi/Root/interface";
import { formatMoney } from "@/utils/format/masks";
import type { OrderStatus, OrdersStats } from "./interface";

export const buildOrderKpis = (stats: OrdersStats): KpiItem[] => {
  const { totalOrders, totalAmount, avgTicket } = stats.orderStats;

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

export const STATUS_LABEL: Record<OrderStatus, string> = {
  DRAFT: "Rascunho",
  SENT: "Enviado",
  CONFIRMED: "Confirmado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

export const STATUS_COLOR: Record<OrderStatus, "neutral" | "blue" | "amber" | "green" | "red"> = {
  DRAFT: "neutral",
  SENT: "blue",
  CONFIRMED: "amber",
  DELIVERED: "green",
  CANCELLED: "red",
};

export function clientName(
  client: { razaoSocial: string; nomeFantasia: string | null } | null
): string {
  if (!client) return "—";
  return client.nomeFantasia ?? client.razaoSocial;
}

export function factoryName(
  factory: { nomeFantasia: string | null; razaoSocial: string } | null
): string {
  if (!factory) return "—";
  return factory.nomeFantasia ?? factory.razaoSocial;
}
