import type { CommissionStatus } from "@/app/(inside)/_shared/commissions";

/**
 * Uma parcela de comissão, como o backend a devolve (`CommissionRowType`).
 *
 * A situação vem do vocabulário compartilhado em `_shared/commissions`: é a mesma
 * parcela que a tela de Comissões mostra, e o relatório é outra vista dela.
 */
export interface CommissionRow {
  orderId: string;
  installmentId: string;
  sequence: number;
  orderDate: string;
  invoicedAt: string | null;
  dueDate: string | null;
  paidAt: string | null;
  installmentAmount: string;
  amount: string;
  status: CommissionStatus;
  /** Data em que a comissão CAI — é por ela que o período recorta. */
  receiveDate: string | null;
  isReceivable: boolean;
  isReceived: boolean;
  isReconciled: boolean;
  reconciledAt: string | null;
  /** Boleto vencido e ainda não pago pelo cliente. */
  isOverdue: boolean;
  /** Quando o boleto virou calote; null = não é inadimplente. */
  defaultedAt: string | null;
  client: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
  } | null;
  factory: {
    id: string;
    nomeFantasia: string | null;
    razaoSocial: string;
  } | null;
  seller: { id: string; name: string } | null;
}

export interface CommissionsReportResponse {
  commissions_report: {
    totalReceivable: string;
    totalReceived: string;
    totalPending: string;
    countReceivable: number;
    rows: CommissionRow[];
  };
}

/** Fechamento do período: o que entra, o que entrou e o que ainda depende da fábrica. */
export interface CommissionsTotals {
  /** Já líquido dos estornos: é o que a fábrica realmente vai pagar. */
  receivable: number;
  received: number;
  pending: number;
  count: number;
  countReceivable: number;
  /** Estornos (negativo) por calote do cliente. */
  chargeback: number;
  /** Parcelas com boleto vencido ou em calote. */
  countOverdue: number;
}

/** Uma barra do gráfico: a comissão do período naquela fábrica. */
export interface CommissionsByFactory {
  factoryId: string;
  name: string;
  receivable: number;
  received: number;
  pending: number;
  count: number;
}
