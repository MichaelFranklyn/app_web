import { KpiItem } from "@/components/Card/Kpi/Root/interface";
import { FieldConfig } from "@/hooks/useTableFilters";
import { formatMoney } from "@/utils/format/masks";
import type { SortLabel } from "@/utils/pdf/context";
import { ORDER_KPI_HELP } from "./help";
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
 * Fábrica, vendedor e cliente têm filtros próprios (dizem exatamente o que está
 * sendo consultado); a busca livre ficou para o que não vira select: o CÓDIGO
 * do pedido, que é como ele circula fora do sistema (papel, WhatsApp, e-mail).
 */
export const ORDER_TABLE_FIELDS: Record<string, FieldConfig> = {
  // Busca livre do backend (`search`): casa o CÓDIGO do pedido (o prefixo do
  // id que a tela, o PDF e o WhatsApp mostram), o nome da fábrica e o do
  // vendedor. É o caminho de volta de quem tem o código na mão e não sabe de
  // qual cliente ele é — sem isso, achar o pedido exigia adivinhar o filtro.
  search: { type: "text", queryField: "search", operator: "like" },
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

/**
 * Por onde a lista pode ser ordenada — os mesmos nomes que vão no `sortKey` de
 * cada `Table.Head`.
 *
 * Os quatro primeiros são colunas de `orders`. Cliente, fábrica e vendedor não
 * são: na tabela do pedido eles são só o UUID da chave estrangeira. O
 * repositório de pedidos alcança a tabela vizinha e ordena pelo nome EXIBIDO —
 * o mesmo que a coluna mostra, apelido da fábrica incluído (ver
 * `_related_sort_criteria`, no backend).
 */
export const ORDER_SORTABLE_FIELDS = [
  "order_date",
  "status",
  "total_amount",
  "commission_amount",
  "client_name",
  "factory_name",
  "seller_name",
];

/**
 * Como cada coluna ordenável se chama no papel, e em que sentido ela é lida.
 *
 * Serve ao cabeçalho do PDF, que registra a ordenação junto com os filtros: a
 * lista dos maiores pedidos impressa sem essa linha passa pela lista do mês em
 * ordem de data, e a conferência começa pelo pedido errado.
 */
export const ORDER_SORT_LABELS: Record<string, SortLabel> = {
  order_date: { label: "Data", kind: "date" },
  client_name: { label: "Cliente", kind: "text" },
  factory_name: { label: "Fábrica", kind: "text" },
  seller_name: { label: "Vendedor", kind: "text" },
  status: { label: "Situação", kind: "text" },
  total_amount: { label: "Valor", kind: "number" },
  commission_amount: { label: "Comissão", kind: "number" },
};

/**
 * A ordem que o backend já aplica sozinho (ver `_default_order_ordering`): do
 * pedido mais recente para o mais antigo. Declarada aqui só para o cabeçalho
 * mostrar a seta na coluna certa antes do primeiro clique.
 */
export const ORDER_DEFAULT_SORT = {
  key: "order_date",
  direction: "desc",
} as const;

// O vocabulário do status mora em `_shared`: a lista de pedidos e os pedidos do
// cliente são rotas-irmãs e precisam falar a mesma língua. Aqui só se reexporta
// para não mexer nos imports de quem já lê de `../utils`.
export {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  ORDER_STATUS_TONE,
  orderStatusLabel,
} from "../../_shared/orderStatus";

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

  // Os cartões contam só PEDIDO FEITO (confirmado, faturado, entregue) — ver
  // `_apply_placed_only`, no backend. A legenda diz isso: sem ela, o número
  // menor que o da lista (que mostra orçamento e cancelado) parece erro.
  const scope = isFiltered ? "no filtro atual" : "da empresa";

  // O texto de cada cartão vem de `help.tsx`, indexado pelo rótulo: os quatro
  // somam coisas diferentes (todos os pedidos × só a mercadoria × só o
  // faturado), e sem isso "Valor total" e "Faturado" parecem o mesmo número
  // divergindo.
  return [
    {
      label: "Pedidos",
      value: String(totalOrders),
      delta: `pedidos feitos ${scope}`,
      status: "atencao",
      help: ORDER_KPI_HELP["Pedidos"],
    },
    {
      label: "Valor total",
      value: formatMoney(totalAmount),
      delta: `ticket médio ${formatMoney(avgTicket)}`,
      positive: totalOrders > 0,
      status: "ok",
      help: ORDER_KPI_HELP["Valor total"],
    },
    {
      // O número que responde "quanto de pedido a fábrica já faturou" —
      // faturado é o marco que libera a comissão, não o pedido feito.
      label: "Faturado",
      value: formatMoney(invoicedAmount),
      delta: `${invoicedOrders} de ${totalOrders} pedidos faturados`,
      positive: invoicedOrders > 0,
      status: "ok",
      help: ORDER_KPI_HELP["Faturado"],
    },
    {
      label: "Comissão do faturado",
      value: formatMoney(commissionAmount),
      delta: "gerada pelo que já foi faturado",
      status: "neutral",
      help: ORDER_KPI_HELP["Comissão do faturado"],
    },
  ];
};
