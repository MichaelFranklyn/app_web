import {
  ClientProductAnalysisRow,
  ProductAnalysisSummaryData,
} from "./interface";

/**
 * "Compra sempre" é uma fração, não um rótulo: 8 dos 10 pedidos que ele fez
 * naquela fábrica levaram este produto.
 */
export const PRESENCE_SHARE_ALWAYS = 0.8;

/** Quantos pedidos precisam existir para a fração significar algo. */
const MIN_ORDERS_FOR_SHARE = 3;

export const presenceShare = (row: ClientProductAnalysisRow): number =>
  row.factoryOrderCount > 0 ? row.orderCount / row.factoryOrderCount : 0;

/** É um produto "de sempre" deste cliente? */
export const isStaple = (row: ClientProductAnalysisRow): boolean =>
  row.factoryOrderCount >= MIN_ORDERS_FOR_SHARE &&
  presenceShare(row) >= PRESENCE_SHARE_ALWAYS;

/**
 * Os números do topo. Somados no cliente, e não pedidos ao servidor, pela mesma
 * razão dos cartões de comissão: a lista inteira já está aqui, e um total que
 * vem de outra consulta é um total que pode discordar da tabela.
 */
export const summarizeAnalysis = (
  rows: ClientProductAnalysisRow[]
): ProductAnalysisSummaryData => ({
  total: rows.length,
  stopped: rows.filter((r) => r.status === "STOPPED").length,
  late: rows.filter((r) => r.status === "LATE").length,
  due: rows.filter((r) => r.status === "DUE").length,
  always: rows.filter(isStaple).length,
});

/** "a cada 30 dias" — e o vazio honesto quando não há duas compras. */
export const cycleLabel = (days: number | null): string =>
  days ? `a cada ${days} dias` : "—";
