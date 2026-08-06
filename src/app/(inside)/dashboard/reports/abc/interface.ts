/** Classe do cliente na curva de Pareto — o enum `AbcClass` do schema. */
export type AbcClass = "A" | "B" | "C";

/** Um cliente na curva, do maior faturamento para o menor. */
export interface AbcRow {
  clientId: string;
  clientName: string;
  /** Posição na curva (1 = maior faturamento do período). */
  rank: number;
  totalAmount: string;
  orderCount: number;
  commissionAmount: string;
  /** Fatia deste cliente no faturamento do período (0 a 1). */
  share: number;
  /** Fatia acumulada até esta linha, inclusive (0 a 1). */
  cumulativeShare: number;
  abcClass: AbcClass;
  lastOrderDate: string | null;
}

export interface AbcCurveResponse {
  clientAbcCurve: AbcRow[];
}

/** Recorte local da aba: qual classe está à vista. */
export type AbcScope = "all" | AbcClass;
