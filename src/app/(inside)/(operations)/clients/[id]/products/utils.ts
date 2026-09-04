import {
  ClientProductAnalysisRow,
  ProductAnalysisSummaryData,
  ProductPurchaseStatus,
} from "./interface";

/** Rótulos das situações — a frase que o vendedor lê, não o nome do enum. */
export const STATUS_LABEL: Record<ProductPurchaseStatus, string> = {
  ON_TRACK: "Comprando normal",
  DUE: "Hora de repor",
  LATE: "Atrasado",
  STOPPED: "Parou de comprar",
  SINGLE: "Comprou uma vez",
};

export const STATUS_COLOR: Record<
  ProductPurchaseStatus,
  "green" | "amber" | "red" | "neutral" | "blue"
> = {
  ON_TRACK: "green",
  DUE: "amber",
  LATE: "red",
  STOPPED: "neutral",
  SINGLE: "blue",
};

/** O que fazer com o produto, em uma frase. Vira o `title` da situação. */
export const STATUS_HINT: Record<ProductPurchaseStatus, string> = {
  ON_TRACK:
    "O cliente comprou dentro do ritmo dele. Não precisa de atenção agora.",
  DUE: "Pelo ritmo de compra, o cliente já deve estar precisando. Ofereça.",
  LATE: "Passou do ritmo de compra. Vale perguntar o que aconteceu.",
  STOPPED:
    "O cliente comprava e deixou de comprar. Pode ter trocado de fornecedor.",
  SINGLE: "Comprou uma única vez. Ainda não há ritmo de compra para comparar.",
};

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

/** "há 12 dias" / "hoje" — o tempo como a pessoa conta. */
export const daysAgoLabel = (days: number): string => {
  if (days <= 0) return "hoje";
  if (days === 1) return "ontem";
  return `há ${days} dias`;
};

/** Quantidade em unidades, sem casas quando é inteira (o caso comum). */
export const unitsLabel = (value: string | number): string => {
  const num = Number(value);
  if (!Number.isFinite(num)) return "—";
  return Number.isInteger(num)
    ? String(num)
    : num.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
};
