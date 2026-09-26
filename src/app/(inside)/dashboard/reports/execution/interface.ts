/** A execução da rotina de um vendedor no período. */
export interface ExecutionSellerRow {
  sellerId: string;
  sellerName: string;
  planned: number;
  /** Respondidas por alguém ou provadas por pedido. */
  worked: number;
  /** Das `worked`, as concluídas pelo pedido, sem ninguém marcar. */
  workedInferred: number;
  /** Fechadas pelo sistema após 7 dias sem resposta. Não são execução. */
  autoClosed: number;
  /** Sem resposta e ainda dentro do prazo. */
  pending: number;
  converted: number;
  executionRate: number;
  conversionRate: number;
  orderAmount: string;
}

export interface VisitExecutionReport {
  planned: number;
  worked: number;
  workedInferred: number;
  autoClosed: number;
  pending: number;
  converted: number;
  conversionRate: number;
  executionRate: number;
  baselineRate: number;
  lift: number | null;
  isLiftReliable: boolean;
  orderAmount: string;
  sellers: ExecutionSellerRow[];
}

export interface VisitExecutionResponse {
  visitAccuracyReport: VisitExecutionReport;
}
