/** Situação da comissão de uma parcela, calculada pelo backend. */
export type CommissionStatus =
  | "pending"
  | "receivable"
  | "received"
  | "cancelled";

/** Linha crua devolvida pela query `commissions`. */
export interface CommissionChartRow {
  /** Data em que a comissão cai (prevista ou realizada). Nula sem base p/ prever. */
  receiveDate: string | null;
  amount: string;
  /** Valor da parcela faturada — base sobre a qual a comissão foi calculada. */
  installmentAmount: string;
  status: CommissionStatus;
  seller: { id: string; name: string } | null;
  factory: {
    id: string;
    nickname: string | null;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
}

export interface CommissionRowsResponse {
  commissions: {
    rows: CommissionChartRow[];
  };
}

/**
 * Linha já recortada pelos filtros da página e normalizada: valores numéricos,
 * mês resolvido e nomes de exibição prontos. Todos os gráficos da seção partem
 * daqui, então a regra de "o que entra na conta" vive num lugar só.
 */
export interface ScopedCommissionRow {
  /** "YYYY-MM-DD" da data de recebimento. */
  date: string;
  /** "YYYY-MM" da data de recebimento — o mês em que a comissão cai. */
  month: string;
  status: Exclude<CommissionStatus, "cancelled">;
  /** Valor da comissão da parcela. */
  amount: number;
  /** Valor faturado da parcela (base da taxa efetiva). */
  base: number;
  sellerId: string;
  sellerName: string;
  factoryId: string;
  factoryName: string;
}

/** Consolidado de um vendedor ou de uma fábrica no período. */
export interface CommissionEntityTotals {
  id: string;
  name: string;
  /** Comissão total do período (previsto + a receber + recebido). */
  total: number;
  received: number;
  receivable: number;
  pending: number;
  /** Soma das parcelas faturadas — base para a taxa efetiva. */
  base: number;
}
