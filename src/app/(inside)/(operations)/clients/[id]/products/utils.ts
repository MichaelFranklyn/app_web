import {
  ClientProductAnalysisRow,
  ProductAnalysisSummaryData,
} from "./interface";
import { plural } from "@/utils/format/plural";

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

/**
 * "a cada 30 dias". Sem duas compras não há ritmo; com UMA só, a tela diz por
 * quê em vez do traço, que parecia dado faltando (crítica de 23/11/2026).
 */
export const cycleLabel = (days: number | null, orderCount = 0): string => {
  if (days) return `a cada ${days} dias`;
  return orderCount === 1 ? "1 compra só, sem ritmo ainda" : "—";
};

/** Média em unidades inteiras: "média 12,37" é precisão que ninguém usa. */
export const roundedUnits = (value: string | number): number | string => {
  const num = Number(value);
  if (!Number.isFinite(num)) return value;
  // Abaixo de 1 o arredondamento daria zero, que é mentira: mantém a fração.
  return num >= 1 ? Math.round(num) : value;
};

/** "atrasada 12 dias" — a data esperada que já passou diz quanto passou. */
export const overdueLabel = (overdueDays: number | null): string | null =>
  overdueDays && overdueDays > 0
    ? `atrasada ${plural(overdueDays, "dia", "dias")}`
    : null;
