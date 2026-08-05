import { toUtcIsoDate } from "@/utils/format/date";
import { ReportTab } from "./interface";

/**
 * As cinco abas, na ordem em que a operação acontece: vende-se (vendas), manda-se
 * para a fábrica (pedidos enviados), recebe-se por isso (comissões), e então se
 * olha para trás — quem comprou (positivação) e quem é a carteira (clientes).
 */
export const REPORT_TABS: ReportTab[] = [
  { slug: "sales", label: "Vendas" },
  { slug: "sent-orders", label: "Pedidos enviados" },
  { slug: "commissions", label: "Comissões" },
  { slug: "positivation", label: "Positivação" },
  { slug: "clients", label: "Clientes" },
];

export const REPORTS_BASE_PATH = "/dashboard/reports";

/**
 * Papéis que enxergam os dados de qualquer vendedor e escolhem de quem ver. Para
 * o vendedor o seletor nem aparece: o backend escopa pelo token, e um seletor que
 * não muda nada só faria parecer que ele pode ver a carteira do colega.
 */
export const MANAGER_ROLES = ["OWNER", "ADMIN", "SU"];

/**
 * Período default: o mês corrente, do dia 1 até hoje.
 *
 * Difere dos gráficos de Desempenho (12 meses) de propósito — um relatório é
 * tirado para conferir o mês que está correndo, não para ver tendência. Doze
 * meses de linha-a-linha seriam milhares de linhas que ninguém pediu.
 */
export const getCurrentMonthRangeIso = (): { from: string; to: string } => {
  const now = new Date();
  return {
    from: toUtcIsoDate(
      new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
    ),
    to: toUtcIsoDate(
      new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
    ),
  };
};

/**
 * Situações que significam "virou pedido de verdade": saiu do vendedor e está
 * na fábrica. Orçamento (DRAFT/SENT) é proposta em aberto e cancelado não é
 * venda — nenhum dos dois entra em relatório de faturamento ou de positivação.
 *
 * Vai no filtro `status_in` da query `orders` (o backend traduz os nomes nos
 * valores gravados na coluna).
 */
export const PLACED_ORDER_STATUSES = ["CONFIRMED", "INVOICED", "DELIVERED"];

/** Divisão que devolve 0 em vez de `Infinity`/`NaN` quando não há base. */
export const safeRate = (part: number, total: number): number =>
  total > 0 ? part / total : 0;

/** Nome do arquivo exportado, com o recorte na etiqueta: `vendas-2026-07-01.xlsx`. */
export const reportFileName = (
  slug: string,
  from: string,
  extension: "xlsx" | "pdf"
): string => `${slug}-${from}.${extension}`;
