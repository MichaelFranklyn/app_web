import { KpiItem } from "@/components/Card/Kpi/Root/interface";
import { FieldConfig } from "@/hooks/useTableFilters";
import { formatMoney } from "@/utils/format/masks";
import type { OrdersStats } from "./interface";

/**
 * Campos que viram filtro na query — cada chave é também o nome do parâmetro na
 * URL, então um recorte filtrado pode ser copiado e enviado a outra pessoa.
 *
 * `seller_id` e `pending_invoice` não são colunas: o backend os traduz (escopo
 * de vendedor e a aba "ainda não faturados"). Os demais são colunas de `orders`
 * — as datas entram duas vezes, uma ponta com `gte` e outra com `lte`, que o
 * backend combina com AND.
 *
 * Não há mais busca livre por texto: fábrica, vendedor e cliente viraram
 * filtros próprios, que dizem exatamente o que está sendo consultado. O
 * backend continua aceitando o filtro `search` — só ninguém o envia daqui.
 */
export const ORDER_TABLE_FIELDS: Record<string, FieldConfig> = {
  sellerId: { type: "select", queryField: "seller_id" },
  factoryId: { type: "select", queryField: "factory_id" },
  clientId: { type: "select", queryField: "client_id" },
  // O valor viaja como NOME do enum (CONFIRMED); o backend o traduz no valor
  // gravado na coluna, que está em português — ver _scope_order_filters.
  status: { type: "select", queryField: "status" },
  orderDateFrom: { type: "select", queryField: "order_date", operator: "gte" },
  orderDateTo: { type: "select", queryField: "order_date", operator: "lte" },
  invoicedFrom: { type: "select", queryField: "invoiced_at", operator: "gte" },
  invoicedTo: { type: "select", queryField: "invoiced_at", operator: "lte" },
};

/**
 * Os mesmos campos, menos a situação, para a aba "Ainda não faturados".
 *
 * Tirar o campo da lista (em vez de só escondê-lo) é o que impede um filtro
 * invisível: `useTableFilters` só lê da URL as chaves que estão aqui, então um
 * `?status=DRAFT` herdado da outra aba não continua valendo sem aparecer.
 */
export const PENDING_ORDER_TABLE_FIELDS: Record<string, FieldConfig> =
  Object.fromEntries(
    Object.entries(ORDER_TABLE_FIELDS).filter(([key]) => key !== "status")
  );

// O vocabulário do status mora em `_shared`: a lista de pedidos e os pedidos do
// cliente são rotas-irmãs e precisam falar a mesma língua. Aqui só se reexporta
// para não mexer nos imports de quem já lê de `../utils`.
export {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_TONE,
} from "../_shared/orderStatus";

export const buildOrderKpis = (
  stats: OrdersStats,
  /** Há filtro ativo? Muda a legenda: "da empresa" × "no filtro atual". */
  isFiltered = false
): KpiItem[] => {
  // Defensivo: se o back não devolver `orderStats` (hiccup/edge de loading),
  // degrada para zeros em vez de derrubar a página inteira.
  const {
    totalOrders = 0,
    totalAmount = "0",
    avgTicket = "0",
    invoicedOrders = 0,
    invoicedAmount = "0",
    commissionAmount = "0",
  } = stats.orderStats ?? {};

  const scope = isFiltered ? "no filtro atual" : "da empresa";

  return [
    {
      label: "Pedidos",
      value: String(totalOrders),
      delta: `pedidos ${scope}`,
      status: "atencao",
    },
    {
      label: "Valor total",
      value: formatMoney(totalAmount),
      delta: `ticket médio ${formatMoney(avgTicket)}`,
      positive: totalOrders > 0,
      status: "ok",
    },
    {
      // O número que responde "quanto de pedido a fábrica já faturou" —
      // faturado é o marco que libera a comissão, não o pedido feito.
      label: "Faturado",
      value: formatMoney(invoicedAmount),
      delta: `${invoicedOrders} de ${totalOrders} pedidos faturados`,
      positive: invoicedOrders > 0,
      status: "ok",
    },
    {
      label: "Comissão do faturado",
      value: formatMoney(commissionAmount),
      delta: "gerada pelo que já foi faturado",
      status: "neutral",
    },
  ];
};
