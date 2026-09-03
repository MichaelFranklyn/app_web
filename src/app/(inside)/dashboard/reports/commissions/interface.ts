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
  /** Nota fiscal do pedido — a chave pela qual a planilha da fábrica é conferida. */
  invoiceNumber: string | null;
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
  /** Fatia do vendedor nesta parcela (negativa em estorno). */
  sellerAmount: string;
  sellerStatus: CommissionStatus;
  sellerReceiveDate: string | null;
  /** O escritório já repassou a fatia ao vendedor. */
  isSellerPaid: boolean;
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

/**
 * A repartição da comissão do período entre a empresa e os vendedores.
 *
 * São dois acordos empilhados: a fábrica paga o escritório, o escritório
 * repassa uma fatia ao vendedor. Só faz sentido para quem vê o nível do
 * escritório (gestor) — na visão do vendedor `amount` já é a fatia dele.
 */
export interface CommissionsSplit {
  /** O que as fábricas pagam ao escritório. */
  company: number;
  /** O que o escritório repassa aos vendedores dessas mesmas parcelas. */
  seller: number;
  /** O que sobra para o escritório. */
  office: number;
  /** Fatia do escritório sobre a comissão das fábricas (0 a 1). */
  margin: number;
}

/** Uma barra do gráfico: a comissão do período naquela fábrica. */
export interface CommissionsByFactory {
  factoryId: string;
  name: string;
  receivable: number;
  received: number;
  pending: number;
  count: number;
  /** Repartição da comissão daquela fábrica entre escritório e vendedor. */
  split: CommissionsSplit;
}
