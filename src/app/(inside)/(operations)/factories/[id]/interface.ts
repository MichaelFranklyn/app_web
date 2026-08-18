export interface FactoryDetail {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  /** Apelido que a empresa deu à fábrica (mora no vínculo). */
  nickname: string | null;
  /** Logo enviada pela empresa (caminho relativo /media/...). */
  logoUrl: string | null;
  addressCity: string | null;
  addressState: string | null;
  deletedAt: string | null;
}

export interface CompanyFactoryDetail {
  id: string;
  commissionRate: number;
  commissionCalcBasis: string;
  paymentTermDays: number;
  commissionPaymentDays: number[] | null;
  /**
   * Dia do mês até o qual o faturamento entra no fechamento da comissão do mês
   * seguinte. Nulo = fábrica sem corte declarado.
   */
  commissionCutoffDay: number | null;
  /** De onde contam os dias do boleto: "Faturamento" (padrão) ou "Pedido". */
  installmentDueBasis: string | null;
  territory: string;
  contractStart: string | null;
  contractEnd: string | null;
  specialConditions: Record<string, unknown> | null;
  ipiInOrder: boolean;
  /** Prazo de entrega padrão (dias), contado do faturamento. Nulo = sem padrão. */
  deliveryEstimateDays: number | null;
  /** Piso para o pedido existir na fábrica. Nulo = fábrica sem mínimo. */
  minOrderAmount: number | null;
  /** Piso de frete grátis, só em CIF — incentivo, nunca bloqueio.
   *  Nulo = a fábrica não oferece. */
  freeFreightCifAmount: number | null;
  factory: FactoryDetail;
}
